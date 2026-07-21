import { Component, input } from '@angular/core';
import { BlocksRenderer } from 'blocks-renderer-angular';
import type { BlocksComponents, BlocksContent, ModifiersComponents } from 'blocks-renderer-angular';

@Component({
    selector: 'app-custom-paragraph',
    standalone: true,
    template: `
        <div class="custom-paragraph">
            <span class="custom-label">Custom paragraph block</span>
            <p><ng-content /></p>
        </div>
    `,
    styles: `
        .custom-paragraph {
            margin: 1rem 0;
            padding: 1rem;
            border: 2px dashed #7c3aed;
            border-radius: 0.75rem;
            background: #f5f3ff;
        }

        .custom-label {
            display: block;
            margin-bottom: 0.5rem;
            color: #6d28d9;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }

        p {
            margin: 0;
        }
    `,
})
export class CustomParagraphComponent {}

@Component({
    selector: 'app-custom-heading',
    standalone: true,
    template: `
        <div class="custom-heading">
            <span>Custom heading block · source level {{ level() }}</span>
            <h2>{{ plainText() }}</h2>
        </div>
    `,
    styles: `
        .custom-heading {
            margin-top: 2rem;
            border-bottom: 3px solid #0f766e;
        }

        span {
            color: #0f766e;
            font-size: 0.75rem;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
        }

        h2 {
            margin: 0.25rem 0 0.5rem;
            color: #134e4a;
        }
    `,
})
export class CustomHeadingComponent {
    level = input.required<number>();
    plainText = input.required<string>();
}

@Component({
    selector: 'app-custom-bold',
    standalone: true,
    template: `<strong class="custom-bold"><ng-content /></strong>`,
    styles: `
        .custom-bold {
            padding: 0.05rem 0.25rem;
            border-radius: 0.25rem;
            color: #9f1239;
            background: #ffe4e6;
            box-shadow: inset 0 -2px #fda4af;
        }
    `,
})
export class CustomBoldComponent {}

@Component({
    selector: 'app-custom-code',
    standalone: true,
    template: `<code class="custom-code"><ng-content /></code>`,
    styles: `
        .custom-code {
            padding: 0.15rem 0.4rem;
            border: 1px solid #fdba74;
            border-radius: 0.25rem;
            color: #9a3412;
            background: #fff7ed;
        }
    `,
})
export class CustomCodeComponent {}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [BlocksRenderer],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
    customBlocks: Partial<BlocksComponents> = {
        paragraph: CustomParagraphComponent,
        heading: CustomHeadingComponent,
    };

    customModifiers: Partial<ModifiersComponents> = {
        bold: CustomBoldComponent,
        code: CustomCodeComponent,
    };

    sampleContent: BlocksContent = [
        {
            type: 'heading',
            level: 1,
            children: [
                {
                    type: 'link',
                    url: 'https://example.com',
                    children: [{ type: 'text', text: 'Welcome to Blocks Renderer' }],
                },
            ],
        },
        {
            type: 'paragraph',
            children: [
                { type: 'text', text: 'This is a simple paragraph with ' },
                { type: 'text', text: 'bold text', bold: true },
                { type: 'text', text: ', ' },
                { type: 'text', text: 'italic text', italic: true },
                { type: 'text', text: ', and ' },
                {
                    type: 'text',
                    text: 'bold underlined text',
                    bold: true,
                    underline: true,
                },
                { type: 'text', text: '.' },
            ],
        },
        {
            type: 'heading',
            level: 2,
            children: [{ type: 'text', text: 'Code Block Example' }],
        },
        {
            type: 'code',
            children: [{ type: 'text', text: 'const example = "Hello, World!";' }],
        },
        {
            type: 'heading',
            level: 2,
            children: [{ type: 'text', text: 'Quote Example' }],
        },
        {
            type: 'quote',
            children: [
                {
                    type: 'text',
                    text: 'This is a blockquote. It can contain formatted text like ',
                },
                { type: 'text', text: 'bold', bold: true },
                { type: 'text', text: ' and ' },
                { type: 'text', text: 'italic', italic: true },
                { type: 'text', text: ' text.' },
            ],
        },
        {
            type: 'heading',
            level: 2,
            children: [{ type: 'text', text: 'List Examples' }],
        },
        {
            type: 'list',
            format: 'unordered',
            children: [
                {
                    type: 'list-item',
                    children: [{ type: 'text', text: 'First unordered item' }],
                },
                {
                    type: 'list-item',
                    children: [
                        { type: 'text', text: 'Second item with ' },
                        { type: 'text', text: 'bold', bold: true },
                        { type: 'text', text: ' text' },
                    ],
                },
                {
                    type: 'list-item',
                    children: [{ type: 'text', text: 'Third item' }],
                },
            ],
        },
        {
            type: 'list',
            format: 'ordered',
            children: [
                {
                    type: 'list-item',
                    children: [{ type: 'text', text: 'First ordered item' }],
                },
                {
                    type: 'list-item',
                    children: [{ type: 'text', text: 'Second ordered item' }],
                },
                {
                    type: 'list-item',
                    children: [{ type: 'text', text: 'Third ordered item' }],
                },
            ],
        },
        {
            type: 'paragraph',
            children: [
                { type: 'text', text: 'You can also have ' },
                { type: 'text', text: 'strikethrough', strikethrough: true },
                { type: 'text', text: ' and ' },
                { type: 'text', text: 'inline code', code: true },
                { type: 'text', text: ' in paragraphs.' },
            ],
        },
    ];
}
