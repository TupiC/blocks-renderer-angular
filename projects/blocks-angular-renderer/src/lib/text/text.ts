import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import type { Modifier } from '../types';
import { ComponentsContextService } from '../components-context.service';

@Component({
    selector: 'lib-text',
    imports: [CommonModule],
    templateUrl: './text.html',
    standalone: true,
})
export class Text {
    @Input() text!: string;
    @Input() bold?: boolean;
    @Input() italic?: boolean;
    @Input() underline?: boolean;
    @Input() strikethrough?: boolean;
    @Input() code?: boolean;

    private componentsContext = inject(ComponentsContextService);
    private sanitizer = inject(DomSanitizer);

    get modifiers(): Modifier[] {
        const mods: Modifier[] = [];
        if (this.bold) mods.push('bold');
        if (this.italic) mods.push('italic');
        if (this.underline) mods.push('underline');
        if (this.strikethrough) mods.push('strikethrough');
        if (this.code) mods.push('code');
        return mods;
    }

    get textParts(): string[] {
        return this.text.split(/\r?\n|\r/g);
    }

    getModifierComponent(modifierName: Modifier): any {
        const component = this.componentsContext.getModifierComponent(modifierName);
        if (!component) {
            this.componentsContext.addMissingModifierType(modifierName);
        }
        return component;
    }

    applyModifiers(content: string): SafeHtml {
        let result = content;

        const mods = [...this.modifiers].reverse();

        for (const modifier of mods) {
            const customComponent = this.getModifierComponent(modifier);
            if (customComponent) {
                result = this.getDefaultModifierHtml(result, modifier);
            } else {
                result = this.getDefaultModifierHtml(result, modifier);
            }
        }

        return this.sanitizer.sanitize(1, result) as SafeHtml;
    }

    private getDefaultModifierHtml(content: string, modifier: Modifier): string {
        switch (modifier) {
            case 'bold':
                return `<strong>${content}</strong>`;
            case 'italic':
                return `<em>${content}</em>`;
            case 'underline':
                return `<u>${content}</u>`;
            case 'strikethrough':
                return `<del>${content}</del>`;
            case 'code':
                return `<code>${content}</code>`;
            default:
                return content;
        }
    }
}
