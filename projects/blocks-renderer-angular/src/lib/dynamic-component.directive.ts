import {
    ComponentRef,
    Directive,
    EmbeddedViewRef,
    Input,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    TemplateRef,
    Type,
    ViewContainerRef,
    inject,
} from '@angular/core';

@Directive({
    selector: '[libDynamicComponent]',
    standalone: true,
})
export class DynamicComponentDirective implements OnChanges, OnDestroy {
    @Input({ required: true }) libDynamicComponent!: Type<unknown>;
    @Input() libDynamicComponentInputs: Record<string, unknown> = {};
    @Input() libDynamicComponentContent?: TemplateRef<unknown>;
    @Input() libDynamicComponentContentContext: Record<string, unknown> = {};

    private readonly viewContainer = inject(ViewContainerRef);

    private componentRef?: ComponentRef<unknown>;
    private contentView?: EmbeddedViewRef<unknown>;
    private inputNames = new Set<string>();

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['libDynamicComponent'] || changes['libDynamicComponentContent']) {
            this.renderComponent();
            return;
        }

        if (changes['libDynamicComponentInputs']) {
            this.updateInputs();
        }

        if (changes['libDynamicComponentContentContext'] && this.contentView) {
            Object.assign(
                this.contentView.context as Record<string, unknown>,
                this.libDynamicComponentContentContext,
            );
            this.contentView.markForCheck();
        }
    }

    ngOnDestroy(): void {
        this.viewContainer.clear();
    }

    private renderComponent(): void {
        this.viewContainer.clear();
        this.componentRef = undefined;
        this.contentView = undefined;
        this.inputNames.clear();

        if (!this.libDynamicComponent) return;

        const projectableNodes = this.createProjectableNodes();
        this.componentRef = this.viewContainer.createComponent(this.libDynamicComponent, {
            projectableNodes,
        });
        this.updateInputs();
    }

    private createProjectableNodes(): Node[][] | undefined {
        if (!this.libDynamicComponentContent) return undefined;

        this.contentView = this.viewContainer.createEmbeddedView(this.libDynamicComponentContent, {
            ...this.libDynamicComponentContentContext,
        });
        return [this.contentView.rootNodes as Node[]];
    }

    private updateInputs(): void {
        if (!this.componentRef) return;

        const inputs = this.libDynamicComponentInputs ?? {};
        for (const oldInputName of this.inputNames) {
            if (!(oldInputName in inputs)) {
                this.componentRef.setInput(oldInputName, undefined);
            }
        }

        for (const [name, value] of Object.entries(inputs)) {
            this.componentRef.setInput(name, value);
        }

        this.inputNames = new Set(Object.keys(inputs));
    }
}
