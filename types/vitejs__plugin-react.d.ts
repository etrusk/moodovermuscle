// Type definition override for @vitejs/plugin-react
// Fixes syntax error in official types: Cannot use '"module.exports"' as export name
// See: .docs/current-task.md - TypeScript Type-Check Failure

declare module '@vitejs/plugin-react' {
  import type { Plugin } from 'vite';

  export interface BabelOptions {
    babelrc?: boolean;
    configFile?: boolean | string;
    plugins?: any[];
    presets?: any[];
  }

  export interface ReactBabelOptions {
    runtime?: 'automatic' | 'classic';
    importSource?: string;
    throwIfNamespace?: boolean;
    development?: boolean;
    useBuiltIns?: boolean;
    useSpread?: boolean;
  }

  export interface Options {
    include?: string | RegExp | Array<string | RegExp>;
    exclude?: string | RegExp | Array<string | RegExp>;
    jsxRuntime?: 'automatic' | 'classic';
    jsxImportSource?: string;
    babel?: BabelOptions & ReactBabelOptions;
  }

  export interface ViteReactPluginApi {
    name: string;
  }

  export default function viteReact(options?: Options): Plugin;
}