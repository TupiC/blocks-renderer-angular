import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Text } from './text';
import { ComponentsContextService } from '../components-context.service';

describe('Text', () => {
    let component: Text;
    let fixture: ComponentFixture<Text>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Text],
            providers: [ComponentsContextService],
        }).compileComponents();

        fixture = TestBed.createComponent(Text);
        component = fixture.componentInstance;
        component.text = 'test';
        fixture.detectChanges();
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
