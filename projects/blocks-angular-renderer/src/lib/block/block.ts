import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Node, DefaultInlineNode } from '../types';
import {
    BlockComponent, ComponentsContextService
} from '../components-context.service';
import { Text } from '../text/text';

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
    imports: [CommonModule, Text],
    templateUrl: './block.html',
    standalone: true,
})
export class Block implements OnInit {
    @Input() content!: Node;

    private componentsContext = inject(ComponentsContextService);

    get blockComponent(): BlockComponent | undefined {
        return this.componentsContext.getBlockComponent(this.content.type);
    }

    get isKnownType(): boolean {
        return (KNOWN_BLOCK_TYPES as readonly string[]).includes(this.content.type);
    }

    get shouldRender(): boolean {
        return !!this.blockComponent || this.isKnownType;
    }

    get isVoidType(): boolean {
        return VOID_TYPES.includes(this.content.type);
    }

    get isEmptyParagraph(): boolean {
        return (
            this.content.type === 'paragraph' &&
            this.content.children.length === 1 &&
            this.content.children[0].type === 'text' &&
            this.content.children[0].text === ''
        );
    }

    get plainText(): string | undefined {
        if (this.content.type === 'code' || this.content.type === 'heading') {
            return this.getPlainText(this.content.children);
        }
        return undefined;
    }

    get blockProps(): any {
        const { children, type, ...props } = this.content;
        if (this.content.type === 'code' || this.content.type === 'heading') {
            return {
                ...props,
                plainText: this.plainText,
            };
        }
        return props;
    }

    get childrenNodes(): DefaultInlineNode[] {
        return this.content.children as DefaultInlineNode[];
    }

    private getPlainText(children: DefaultInlineNode[]): string {
        return children.reduce((currentPlainText: string, node) => {
            if (node.type === 'text') {
                return currentPlainText.concat(node.text);
            }
            if (node.type === 'link') {
                return currentPlainText.concat(this.getPlainText(node.children));
            }
            return currentPlainText;
        }, '');
    }

    ngOnInit(): void {
        if (!this.shouldRender) {
            this.componentsContext.addMissingBlockType(this.content.type);
        }
    }
}
