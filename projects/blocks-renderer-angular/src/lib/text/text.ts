import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Modifier, TextInlineNode } from '../types';
import {
    ComponentsContextService,
    ModifierComponent,
    RendererClass,
} from '../components-context.service';
import { DynamicComponentDirective } from '../dynamic-component.directive';

@Component({
    selector: 'lib-text',
    imports: [CommonModule, DynamicComponentDirective],
    templateUrl: './text.html',
    standalone: true,
})
export class Text {
    text = input.required<string>();
    bold = input<boolean>();
    italic = input<boolean>();
    underline = input<boolean>();
    strikethrough = input<boolean>();
    code = input<boolean>();

    private readonly componentsContext = inject(ComponentsContextService);

    readonly node = computed<TextInlineNode>(() => ({
        type: 'text',
        text: this.text(),
        bold: this.bold(),
        italic: this.italic(),
        underline: this.underline(),
        strikethrough: this.strikethrough(),
        code: this.code(),
    }));

    readonly modifiers = computed<Modifier[]>(() => {
        const mods: Modifier[] = [];
        if (this.bold()) mods.push('bold');
        if (this.italic()) mods.push('italic');
        if (this.underline()) mods.push('underline');
        if (this.strikethrough()) mods.push('strikethrough');
        if (this.code()) mods.push('code');
        return mods;
    });

    get textParts(): string[] {
        return this.componentsContext.transformText(this.node()).split(/\r?\n|\r/g);
    }

    get textClass(): RendererClass | undefined {
        return this.componentsContext.getTextClass(this.node());
    }

    getModifierComponent(modifier: Modifier): ModifierComponent | undefined {
        return this.componentsContext.getModifierComponent(modifier);
    }
}
