import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Block } from './block';
import { ComponentsContextService } from '../components-context.service';
import type { ParagraphBlockNode } from '../types';

describe('Block', () => {
    let component: Block;
    let fixture: ComponentFixture<Block>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Block],
            providers: [ComponentsContextService],
        }).compileComponents();

        fixture = TestBed.createComponent(Block);
        component = fixture.componentInstance;
        fixture.componentRef.setInput('content', {
            type: 'paragraph',
            children: [{ type: 'text', text: 'test' }],
        } as ParagraphBlockNode);
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
