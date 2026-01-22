import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlocksAngularRenderer } from './blocks-angular-renderer';

describe('BlocksAngularRenderer', () => {
    let component: BlocksAngularRenderer;
    let fixture: ComponentFixture<BlocksAngularRenderer>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BlocksAngularRenderer],
        }).compileComponents();

        fixture = TestBed.createComponent(BlocksAngularRenderer);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
