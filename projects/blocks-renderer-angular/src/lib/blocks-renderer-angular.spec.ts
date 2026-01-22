import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocksRendererAngular } from './blocks-renderer-angular';

describe('BlocksRendererAngular', () => {
    let component: BlocksRendererAngular;
    let fixture: ComponentFixture<BlocksRendererAngular>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BlocksRendererAngular],
        }).compileComponents();

        fixture = TestBed.createComponent(BlocksRendererAngular);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
