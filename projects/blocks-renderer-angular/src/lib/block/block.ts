import { Component, computed, input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Node, DefaultInlineNode } from '../types';
import {
    BlockComponent,
    ComponentsContextService,
    RendererClass,
} from '../components-context.service';
import { Text } from '../text/text';
import { DynamicComponentDirective } from '../dynamic-component.directive';

const VOID_TYPES = ['image'];

const KNOWN_BLOCK_TYPES = [
    'paragraph',
    'quote',
    'code',
    'heading',
    'list',
    'list-item',
    'link',
    'image',
] as const;

@Component({
    selector: 'lib-block',
    imports: [CommonModule, DynamicComponentDirective, Text],
    templateUrl: './block.html',
    standalone: true,
})
export class Block implements OnInit {
    content = input.required<Node>();

    private componentsContext = inject(ComponentsContextService);

    get blockComponent(): BlockComponent | undefined {
        return this.componentsContext.getBlockComponent(this.content().type);
    }

    get blockClass(): RendererClass | undefined {
        return this.componentsContext.getBlockClass(this.content());
    }

    get isKnownType(): boolean {
        return (KNOWN_BLOCK_TYPES as readonly string[]).includes(this.content().type);
    }

    get shouldRender(): boolean {
        return !!this.blockComponent || this.isKnownType;
    }

    get isVoidType(): boolean {
        return VOID_TYPES.includes(this.content().type);
    }

    get isEmptyParagraph(): boolean {
        const c = this.content();
        if (c.type !== 'paragraph') {
            return false;
        }

        if (c.children.length === 0) {
            return true;
        }

        return (
            c.children.length === 1 && c.children[0].type === 'text' && c.children[0].text === ''
        );
    }

    get plainText(): string | undefined {
        const c = this.content();
        if (c.type === 'code' || c.type === 'heading') {
            return this.getPlainText(c.children);
        }
        return undefined;
    }

    readonly blockProps = computed<Record<string, unknown>>(() => {
        const c = this.content();
        const props: Record<string, unknown> = { ...c };
        delete props['children'];
        delete props['type'];
        if (c.type === 'code' || c.type === 'heading') {
            return {
                ...props,
                plainText: this.plainText,
            };
        }
        return props;
    });

    get childrenNodes(): DefaultInlineNode[] {
        return this.content().children as DefaultInlineNode[];
    }

    private getPlainText(children: DefaultInlineNode[]): string {
        return children.reduce((currentPlainText: string, node) => {
            if (node.type === 'text') {
                return currentPlainText.concat(this.componentsContext.transformText(node));
            }
            if (node.type === 'link') {
                return currentPlainText.concat(this.getPlainText(node.children));
            }
            return currentPlainText;
        }, '');
    }

    ngOnInit(): void {
        if (!this.shouldRender) {
            this.componentsContext.addMissingBlockType(this.content().type);
        }
    }
}
