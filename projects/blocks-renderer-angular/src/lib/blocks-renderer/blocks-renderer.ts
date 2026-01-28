import { Component, input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { BlocksContent } from '../types';
import {
    ComponentsContextService,
    type BlocksComponents,
    type ModifiersComponents,
} from '../components-context.service';
import { Block } from '../block/block';

@Component({
    selector: 'lib-blocks-renderer',
    imports: [CommonModule, Block],
    templateUrl: './blocks-renderer.html',
    standalone: true,
    providers: [ComponentsContextService],
})
export class BlocksRenderer implements OnInit {
    content = input.required<BlocksContent>();
    blocks = input<Partial<BlocksComponents>>();
    modifiers = input<Partial<ModifiersComponents>>();

    private componentsContext = inject(ComponentsContextService);

    ngOnInit(): void {
        const blocks: BlocksComponents = {
            ...(this.blocks() as BlocksComponents),
        };

        const modifiers: ModifiersComponents = {
            ...(this.modifiers() as ModifiersComponents),
        };

        this.componentsContext.setContext({
            blocks,
            modifiers,
            missingBlockTypes: [],
            missingModifierTypes: [],
        });
    }
}
