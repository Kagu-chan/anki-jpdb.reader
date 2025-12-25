import { JPDBToken } from '@shared/jpdb/types';
import { applyTokens } from '../../batches/apply-tokens';
import { Paragraph } from '../../batches/types';
import { Registry } from '../../integration/registry';
import { AutomaticParser } from '../automatic.parser';
import { getMokuroParagraphs } from './mokuro/get-mokuro-paragraphs';

/**
 * Custom Parser for the Mokuro Manga Reader.
 * * This parser handles unique challenges presented by Mokuro's Svelte-based SPA architecture:
 * 1. **Lifecycle Management**: The main content panel (#manga-panel) is destroyed and recreated 
 * when navigating between pages or the library, requiring a persistent "Lifecycle Observer".
 * 2. **Infinite Loops**: The parser modifies the DOM (highlighting text), which triggers the 
 * MutationObserver again. A "Smart Filter" is used to distinguish between page turns and highlighting.
 * 3. **Race Conditions**: Rapid page turning is handled by ID tracking to prevent applying 
 * stale tokens to a new page.
 */
export class MokuroParser extends AutomaticParser {
    // Observer for the specific, currently active manga panel (detects page turns)
    private _panelObserver: MutationObserver | undefined;
    
    // Observer for the document body (detects when the manga panel is destroyed/created)
    private _lifecycleObserver: MutationObserver | undefined;
    
    private _debounceTimer: ReturnType<typeof setTimeout> | undefined;
    private _currentParserId = 0;
    
    // Lock used to prevent the parser from reacting to its own changes (though Smart Filter handles most of this)
    private _isParsing = false;

    /**
     * Entry point. Disables default sentence logic and starts monitoring the global application state.
     */
    protected override init(): void {
        console.log('[Mokuro] Parser Initialized.');
        Registry.sentenceManager.disable();
        this.monitorLifecycle();
    }

    /**
     * Permanently watches the document body to handle SPA navigation.
     * * If the user goes to the Library and back to the Reader, the #manga-panel is destroyed 
     * and a new one is created. This observer ensures we always attach to the *live* panel.
     */
    private monitorLifecycle(): void {
        const checkPanel = () => {
            const panel = document.getElementById('manga-panel');
            // Check if we found a new panel (e.g., initial load or return from library)
            if (panel && !this._panelObserver) {
                console.log('[Mokuro] Panel detected. Attaching.');
                this.attachToPanel(panel);
            } 
            // Check if our current panel died (e.g., navigated away)
            else if (this._panelObserver && !document.body.contains(panel)) {
                console.log('[Mokuro] Panel lost. Detaching.');
                this.disconnectPanelObserver();
            }
        };

        checkPanel();
        this._lifecycleObserver = new MutationObserver(checkPanel);
        this._lifecycleObserver.observe(document.body, { childList: true, subtree: true });
    }

    /**
     * Attaches the "Smart Observer" to the active manga panel.
     * This observer is responsible for detecting when the user turns a page.
     */
    private attachToPanel(panel: HTMLElement): void {
        console.log('[Mokuro] Attaching Smart Observer.');

        this._panelObserver = new MutationObserver((mutations) => {
            if (this._isParsing) return;

            // --- SMART FILTER ---
            // The critical optimization: We must ignore mutations caused by our own highlighter.
            // When we highlight words, we add <span class="..."> tags.
            // When the user turns a page, Mokuro adds <div class="textBox"> tags.
            const isStructuralChange = mutations.some(m => {
                // 1. Ignore attribute changes (usually class updates for highlighting/hover effects)
                if (m.type === 'attributes') return false;

                // 2. Check added nodes to see if this looks like a "Content Update"
                if (m.type === 'childList') {
                    for (const node of Array.from(m.addedNodes)) {
                        if (node instanceof HTMLElement) {
                            // If a DIV or P is added, it's likely a new page/text bubble -> TRIGGER PARSE
                            if (node.tagName === 'DIV' || node.tagName === 'P') {
                                return true;
                            }
                            // If it's a SPAN, it's likely just a highlighter update -> IGNORE
                            if (node.tagName === 'SPAN') {
                                return false;
                            }
                        }
                    }
                }
                return false;
            });

            // Only parse if we found a real structural change (page turn)
            if (isStructuralChange) {
                console.log('[Mokuro] Structural change detected. Scheduling parse.');
                this.scheduleParse(panel);
            }
        });

        this._panelObserver.observe(panel, {
            childList: true,
            subtree: true,
            attributes: true, 
            attributeFilter: ['style', 'class'] // We monitor these but filter them out in the callback
        });

        // Trigger initial parse immediately upon attachment
        this.scheduleParse(panel);
    }

    /**
     * Helper to cleanly disconnect the panel observer (used during navigation).
     */
    private disconnectPanelObserver(): void {
        if (this._panelObserver) {
            this._panelObserver.disconnect();
            this._panelObserver = undefined;
        }
    }

    /**
     * Debounces the parse execution to prevent double-firing during complex DOM transitions.
     */
    private scheduleParse(panel: HTMLElement): void {
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
        this._debounceTimer = setTimeout(() => this.executeParse(panel), 150);
    }

    /**
     * The Core Parsing Logic.
     * Finds the text container, registers it for batch processing, and handles locks.
     */
    private executeParse(panel: HTMLElement): void {
        // Safety check: Don't parse a zombie panel
        if (!document.body.contains(panel)) return;

        const pageId = ++this._currentParserId;
        
        // Use querySelectorAll to find ALL page containers.
        // Mokuro renders 2-page spreads as two sibling div.relative elements.
        const pageContainers = panel.querySelectorAll<HTMLElement>(':scope > div > div.relative');

        if (pageContainers.length === 0) return;

        // Validations: Filter out containers that don't have text (e.g. image-only pages)
        const validContainers = Array.from(pageContainers).filter(container => 
            container.querySelector('.textBox') !== null
        );

        if (validContainers.length === 0) return;

        console.log(`[Mokuro] Executing Parse Run #${pageId} on ${validContainers.length} pages`);
        this._isParsing = true;

        try {
            // Loop through all found pages (left and right) and register them
            validContainers.forEach(container => {
                Registry.batchController.registerNode(container, {
                    // Delegate the actual text extraction to the helper function
                    getParagraphsFn: getMokuroParagraphs,
                    
                    // Callback when tokens arrive from the backend
                    applyFn: (paragraph: Paragraph, tokens: JPDBToken[]) => {
                        // Race Condition Check: 
                        // Only apply tokens if the user hasn't turned the page since we requested them.
                        if (pageId === this._currentParserId) {
                            applyTokens(paragraph, tokens);
                        }
                    }
                });
            });

            // Parse all registered batches at once
            Registry.batchController.parseBatches();
        } finally {
            // Extended timeout releases the lock only after async highlighting is likely finished
            setTimeout(() => { this._isParsing = false; }, 500);
        }
    }

    /**
     * Cleanup method called when the extension is disabled.
     */
    public destroy(): void {
        console.log('[Mokuro] Parser destroyed');
        this.disconnectPanelObserver();
        this._lifecycleObserver?.disconnect();
        if (this._debounceTimer) clearTimeout(this._debounceTimer);
    }

    // --- Override Default Behavior ---
    // We disable the default AutomaticParser observers because Mokuro requires the custom logic above.
    protected override setupVisibleObserver(): void {}
    protected override setupAddedObserver(): void {}
    protected override addedObserverCallback(nodes: HTMLElement[]): void {}
}
