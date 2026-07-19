import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input } from '@angular/core';
import { vi } from 'vitest';

import { BlocksRenderer } from './blocks-renderer';
import type { RootNode, BlocksContent } from '../types';

@Component({
    selector: 'test-custom-block',
    template: `<section class="custom-block"><ng-content /></section>`,
})
class CustomBlock {}

@Component({
    selector: 'test-custom-heading',
    template: `<h2 class="custom-heading">{{ level() }}:{{ plainText() }}</h2>`,
})
class CustomHeading {
    level = input.required<number>();
    plainText = input.required<string>();
}

@Component({
    selector: 'test-custom-modifier',
    template: `<mark class="custom-modifier"><ng-content /></mark>`,
})
class CustomModifier {}

const content: RootNode[] = [
    {
        type: 'heading',
        level: 1,
        children: [
            {
                type: 'link',
                url: 'https://test.com',
                children: [{ type: 'text', text: 'A cool website' }],
            },
        ],
    },
    {
        type: 'paragraph',
        children: [
            { type: 'text', text: 'A simple paragraph' },
            { type: 'text', text: 'with bold text', bold: true },
            {
                type: 'text',
                text: ' and bold underlines',
                bold: true,
                underline: true,
            },
        ],
    },
];

function getByText(el: HTMLElement, text: string | RegExp): HTMLElement | null {
    const walk = (node: Element): HTMLElement | null => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            for (const c of Array.from(node.children)) {
                const found = walk(c);
                if (found) return found;
            }
            const t = el.textContent?.trim();
            if (t && (typeof text === 'string' ? t === text : text.test(t))) return el;
        }
        return null;
    };
    for (const c of Array.from(el.children)) {
        const found = walk(c);
        if (found) return found;
    }
    return null;
}

describe('BlocksRenderer', () => {
    let fixture: ComponentFixture<BlocksRenderer>;
    let native: HTMLElement;

    function render(props: {
        content: BlocksContent;
        blocks?: Partial<Record<string, unknown>>;
        modifiers?: Partial<Record<string, unknown>>;
    }) {
        fixture = TestBed.createComponent(BlocksRenderer);
        fixture.componentRef.setInput('content', props.content);
        if (props.blocks != null) fixture.componentRef.setInput('blocks', props.blocks);
        if (props.modifiers != null) fixture.componentRef.setInput('modifiers', props.modifiers);
        fixture.detectChanges();
        native = fixture.debugElement.nativeElement as HTMLElement;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BlocksRenderer],
        }).compileComponents();
    });

    describe('Props', () => {
        it('should render content using default components', () => {
            render({ content });
            expect(getByText(native, 'A simple paragraph')).toBeTruthy();
        });

        it('should render when blocks and modifiers inputs are provided', () => {
            render({
                content,
                blocks: {},
                modifiers: {},
            });
            expect(getByText(native, 'A simple paragraph')).toBeTruthy();
            expect(native.querySelector('h1')?.textContent?.trim()).toBe('A cool website');
        });

        it('reacts when blocks and modifiers inputs change', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'Reactive content', bold: true }],
                    },
                ],
            });

            expect(native.querySelector('.custom-block')).toBeFalsy();
            expect(native.querySelector('.custom-modifier')).toBeFalsy();

            fixture.componentRef.setInput('blocks', { paragraph: CustomBlock });
            fixture.componentRef.setInput('modifiers', { bold: CustomModifier });
            fixture.detectChanges();

            expect(native.querySelector('.custom-block')).toBeTruthy();
            expect(native.querySelector('.custom-modifier')).toBeTruthy();
            expect(native.textContent).toContain('Reactive content');
        });
    });

    describe('Blocks', () => {
        it('renders paragraphs with text split across children', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            { type: 'text', text: 'A paragraph' },
                            { type: 'text', text: ' with bold', bold: true },
                        ],
                    },
                ],
            });

            const p = getByText(native, 'A paragraph')?.closest('p');
            expect(p).toBeTruthy();
            expect(p?.textContent?.trim()).toBe('A paragraph with bold');
        });

        it('renders a br when there is an empty paragraph', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'First paragraph' }],
                    },
                    { type: 'paragraph', children: [{ type: 'text', text: '' }] },
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'Second paragraph' }],
                    },
                ],
            });

            expect(getByText(native, 'First paragraph')).toBeTruthy();
            expect(getByText(native, 'Second paragraph')).toBeTruthy();
            const blocks = native.querySelectorAll('lib-block');
            expect(blocks.length).toBe(3);
            const br = blocks[1].querySelector('br');
            expect(br).toBeTruthy();
        });

        it('renders paragraphs with line breaks', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'First line\nSecond line' }],
                    },
                ],
            });

            const p = getByText(native, /First line/)?.closest('p');
            expect(p).toBeTruthy();
            expect(p?.textContent?.trim()).toContain('First line');
            expect(p?.textContent?.trim()).toContain('Second line');
            const brs = p?.querySelectorAll('br');
            expect(brs?.length).toBe(1);
        });

        it('renders quotes', () => {
            render({
                content: [
                    {
                        type: 'quote',
                        children: [{ type: 'text', text: 'A quote' }],
                    },
                ],
            });

            const quote = getByText(native, 'A quote');
            expect(quote).toBeTruthy();
            expect(quote?.closest('blockquote')).toBeTruthy();
        });

        it('renders code blocks', () => {
            render({
                content: [{ type: 'code', children: [{ type: 'text', text: 'my code' }] }],
            });

            const code = getByText(native, 'my code');
            expect(code).toBeTruthy();
            expect(code?.closest('code')).toBeTruthy();
            expect(code?.closest('pre')).toBeTruthy();
        });

        it('renders links', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            {
                                type: 'link',
                                url: 'https://test.com',
                                children: [{ type: 'text', text: 'A link' }],
                            },
                        ],
                    },
                ],
            });

            const link = native.querySelector('a[href="https://test.com"]');
            expect(link).toBeTruthy();
            expect(link?.textContent?.trim()).toMatch(/a link/i);
        });

        it('renders flat lists', () => {
            render({
                content: [
                    {
                        type: 'list',
                        format: 'unordered',
                        children: [
                            { type: 'list-item', children: [{ type: 'text', text: 'Item 1' }] },
                            { type: 'list-item', children: [{ type: 'text', text: 'Item 2' }] },
                        ],
                    },
                ],
            });

            const list = native.querySelector('ul');
            expect(list).toBeTruthy();
            const items = native.querySelectorAll('li');
            expect(items.length).toBe(2);
            expect(items[0].textContent?.trim()).toBe('Item 1');
            expect(items[1].textContent?.trim()).toBe('Item 2');
        });

        it('renders nested lists', () => {
            render({
                content: [
                    {
                        type: 'list',
                        format: 'ordered',
                        children: [
                            {
                                type: 'list',
                                format: 'unordered',
                                children: [
                                    {
                                        type: 'list-item',
                                        children: [{ type: 'text', text: 'Nested item 1' }],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            });

            const lists = native.querySelectorAll('ol, ul');
            expect(lists.length).toBe(2);
            expect(getByText(native, 'Nested item 1')).toBeTruthy();
        });

        it('renders images', () => {
            render({
                content: [
                    {
                        type: 'image',
                        image: {
                            name: 'test',
                            alternativeText: 'Test',
                            caption: 'Test',
                            width: 100,
                            height: 100,
                            formats: {},
                            hash: 'test',
                            ext: 'jpg',
                            mime: 'image/jpeg',
                            url: 'https://test.com/test.jpg',
                            size: 100,
                            provider: 'local',
                            createdAt: '2021-01-01',
                            updatedAt: '2021-01-01',
                        },
                        children: [{ type: 'text', text: '' }],
                    },
                ],
            });

            const img = native.querySelector('img[alt="Test"]');
            expect(img).toBeTruthy();
            expect(img?.getAttribute('src')).toBe('https://test.com/test.jpg');
        });

        it('renders registered components with projected children and block inputs', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'Custom paragraph' }],
                    },
                    {
                        type: 'heading',
                        level: 3,
                        children: [{ type: 'text', text: 'Custom heading' }],
                    },
                ],
                blocks: { paragraph: CustomBlock, heading: CustomHeading },
            });

            expect(native.querySelector('.custom-block')?.textContent?.trim()).toBe(
                'Custom paragraph',
            );
            expect(native.querySelector('.custom-heading')?.textContent?.trim()).toBe(
                '3:Custom heading',
            );
            expect(native.querySelector('p')).toBeFalsy();
            expect(native.querySelector('h3')).toBeFalsy();
        });

        it('renders a registered custom block type', () => {
            render({
                content: [
                    {
                        type: 'callout',
                        children: [{ type: 'text', text: 'Custom callout' }],
                    } as unknown as RootNode,
                ],
                blocks: { callout: CustomBlock },
            });

            expect(native.querySelector('.custom-block')?.textContent?.trim()).toBe(
                'Custom callout',
            );
        });

        it('handles missing block components', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            render({
                content: [
                    {
                        type: 'unknown' as 'paragraph',
                        children: [{ type: 'text', text: 'Should not appear' }],
                    },
                    {
                        type: 'unknown' as 'paragraph',
                        children: [{ type: 'text', text: 'Should not appear' }],
                    },
                    {
                        type: 'unknown2' as 'paragraph',
                        children: [{ type: 'text', text: 'Should not appear' }],
                    },
                ],
            });

            expect(getByText(native, 'Should not appear')).toBeFalsy();
            expect(warnSpy).toHaveBeenCalledTimes(2);
            expect(warnSpy).toHaveBeenCalledWith(
                '[blocks-renderer-angular] No component found for block type "unknown"',
            );
            expect(warnSpy).toHaveBeenCalledWith(
                '[blocks-renderer-angular] No component found for block type "unknown2"',
            );
            warnSpy.mockRestore();
        });
    });

    describe('Modifiers', () => {
        it('renders text without modifiers', () => {
            render({
                content: [{ type: 'paragraph', children: [{ type: 'text', text: 'My text' }] }],
            });
            expect(getByText(native, 'My text')).toBeTruthy();
        });

        it('renders text with enabled modifiers', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            {
                                type: 'text',
                                text: 'My text',
                                bold: true,
                                italic: true,
                                underline: true,
                                strikethrough: true,
                                code: true,
                            },
                        ],
                    },
                ],
            });

            const text = getByText(native, 'My text');
            expect(text).toBeTruthy();
            expect(text?.closest('strong')).toBeTruthy();
            expect(text?.closest('em')).toBeTruthy();
            expect(text?.closest('u')).toBeTruthy();
            expect(text?.closest('del')).toBeTruthy();
            expect(text?.closest('code')).toBeTruthy();
        });

        it('ignores disabled modifiers', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'My text', bold: false }],
                    },
                ],
            });

            const text = getByText(native, 'My text');
            expect(text).toBeTruthy();
            expect(text?.closest('strong')).toBeFalsy();
        });

        it('uses default modifiers without missing-component warnings', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            { type: 'text', text: 'My paragraph', bold: true },
                            { type: 'text', text: 'Still my paragraph', bold: true },
                        ],
                    },
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: 'My other paragraph', italic: true }],
                    },
                ],
            });

            expect(getByText(native, /my paragraph/i)).toBeTruthy();
            expect(warnSpy).not.toHaveBeenCalled();
            warnSpy.mockRestore();
        });

        it('renders custom modifiers while preserving modifier nesting', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [
                            {
                                type: 'text',
                                text: 'Custom formatting',
                                bold: true,
                                italic: true,
                            },
                        ],
                    },
                ],
                modifiers: { bold: CustomModifier },
            });

            const customModifier = native.querySelector('mark.custom-modifier');
            expect(customModifier).toBeTruthy();
            expect(customModifier?.querySelector('em')?.textContent?.trim()).toBe(
                'Custom formatting',
            );
        });

        it('renders HTML-looking text as literal text', () => {
            render({
                content: [
                    {
                        type: 'paragraph',
                        children: [{ type: 'text', text: '<em>literal</em>', bold: true }],
                    },
                ],
            });

            expect(native.querySelector('em')).toBeFalsy();
            expect(native.querySelector('strong')?.textContent).toBe('<em>literal</em>');
        });

        it('parses code blocks to plain text', () => {
            render({
                content: [
                    {
                        type: 'code',
                        children: [
                            { type: 'text', text: 'const a = 1;' },
                            {
                                type: 'link',
                                url: 'https://test.com',
                                children: [{ type: 'text', text: 'const b = 2;', bold: true }],
                            },
                        ],
                    },
                ],
            });

            expect(getByText(native, 'const a = 1;const b = 2;')).toBeTruthy();
        });

        it('parses headings to plain text', () => {
            render({ content });
            const h1 = native.querySelector('h1');
            expect(h1).toBeTruthy();
            expect(h1?.textContent?.trim()).toBe('A cool website');
        });
    });
});
