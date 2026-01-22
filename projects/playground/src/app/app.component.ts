import { Component } from '@angular/core';
import { BlocksRenderer } from 'blocks-angular-renderer';
import type { BlocksContent } from 'blocks-angular-renderer';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [BlocksRenderer],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent {
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
