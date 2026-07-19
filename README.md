# blocks-renderer-angular

Angular library for rendering [Strapi blocks content](https://docs.strapi.io/cms/features/content-type-builder#rich-text-blocks) with customizable components.

## Installation

```bash
pnpm add blocks-renderer-angular
```

## Usage

```typescript
import { Component, input } from '@angular/core';
import { BlocksRenderer } from 'blocks-renderer-angular';
import type { BlocksContent } from 'blocks-renderer-angular';

@Component({
    selector: 'app-paragraph',
    template: `<p class="custom-paragraph"><ng-content /></p>`,
})
export class MyParagraphComponent {}

@Component({
    selector: 'app-heading',
    template: `<h2 class="custom-heading">{{ plainText() }}</h2>`,
})
export class MyHeadingComponent {
    plainText = input.required<string>();
}

@Component({
    selector: 'app-bold',
    template: `<strong class="custom-bold"><ng-content /></strong>`,
})
export class MyBoldComponent {}

@Component({
    selector: 'app-content',
    imports: [BlocksRenderer],
    template: `
        <lib-blocks-renderer
            [content]="blocksContent"
            [blocks]="customBlocks"
            [modifiers]="customModifiers"
        >
        </lib-blocks-renderer>
    `,
})
export class ContentComponent {
    blocksContent: BlocksContent = [
        { type: 'paragraph', children: [{ type: 'text', text: 'Hello world' }] },
    ];

    customBlocks = {
        paragraph: MyParagraphComponent,
        heading: MyHeadingComponent,
    };

    customModifiers = {
        bold: MyBoldComponent,
    };
}
```

Custom block components replace the default element for their block type. Their rendered
children are projected through `<ng-content />`, and all node properties except `type` and
`children` are supplied as component inputs. Heading and code components also receive a
`plainText` input. Void blocks such as images receive their node properties but no projected
children.

Custom modifier components wrap their remaining text and modifiers through `<ng-content />`.
Any modifier without a registered component continues to use its default HTML element.

## Releasing

Releases are automated with [semantic-release](https://github.com/semantic-release/semantic-release). Pushing to `main` with [conventional commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `BREAKING CHANGE:`) triggers a release to npm and a GitHub release. No manual version bumping is required.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
