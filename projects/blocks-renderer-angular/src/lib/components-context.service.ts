import { Injectable } from '@angular/core';
import { Type } from '@angular/core';
import type { Modifier, Node, TextInlineNode } from './types';

export type RendererClass =
    | string
    | string[]
    | Set<string>
    | Record<string, boolean | null | undefined>;

export interface RendererRules {
    transformText?: (node: TextInlineNode) => string;
    textClass?: (node: TextInlineNode) => RendererClass;
    blockClass?: (node: Node) => RendererClass;
}

export interface BlockComponentProps {
    [key: string]: unknown;
    children?: unknown;
    plainText?: string;
}

export type BlockComponent = Type<unknown>;
export type ModifierComponent = Type<unknown>;

export interface BlocksComponents {
    [key: string]: BlockComponent;
}

export interface ModifiersComponents {
    [key: string]: ModifierComponent;
}

export interface ComponentsContextValue {
    blocks: BlocksComponents;
    modifiers: ModifiersComponents;
    rules: RendererRules;
    missingBlockTypes: string[];
    missingModifierTypes: string[];
}

@Injectable()
export class ComponentsContextService {
    private context: ComponentsContextValue = {
        blocks: {},
        modifiers: {},
        rules: {},
        missingBlockTypes: [],
        missingModifierTypes: [],
    };

    setContext(context: ComponentsContextValue): void {
        this.context = context;
    }

    getContext(): ComponentsContextValue {
        return this.context;
    }

    getBlockComponent(type: string): BlockComponent | undefined {
        return this.context.blocks[type];
    }

    getModifierComponent(modifier: Modifier): ModifierComponent | undefined {
        return this.context.modifiers[modifier];
    }

    transformText(node: TextInlineNode): string {
        return this.context.rules.transformText?.(node) ?? node.text;
    }

    getTextClass(node: TextInlineNode): RendererClass | undefined {
        return this.context.rules.textClass?.(node);
    }

    getBlockClass(node: Node): RendererClass | undefined {
        return this.context.rules.blockClass?.(node);
    }

    addMissingBlockType(type: string): void {
        if (!this.context.missingBlockTypes.includes(type)) {
            console.warn(`[blocks-renderer-angular] No component found for block type "${type}"`);
            this.context.missingBlockTypes.push(type);
        }
    }

    addMissingModifierType(modifier: string): void {
        if (!this.context.missingModifierTypes.includes(modifier)) {
            console.warn(`[blocks-renderer-angular] No component found for modifier "${modifier}"`);
            this.context.missingModifierTypes.push(modifier);
        }
    }
}
