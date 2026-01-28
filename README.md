# blocks-renderer-angular

Angular library for rendering [Strapi blocks content](https://docs.strapi.io/cms/features/content-type-builder#rich-text-blocks) with customizable components.

## Installation

```bash
npm install blocks-renderer-angular
```

## Usage

```typescript
import { BlocksRenderer } from 'blocks-renderer-angular';
import { BlocksContent } from 'blocks-renderer-angular';

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
