import { MDXEditor } from '@mdxeditor/editor'
import {
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertTable,
  tablePlugin,
  linkPlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  AdmonitionDirectiveDescriptor,
  directivesPlugin,
  frontmatterPlugin,
  imagePlugin,
  linkDialogPlugin,
  InsertCodeBlock,
  InsertThematicBreak,
  ListsToggle,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

interface MarkdownNoteEditorProps {
  content: string
  onChange: (markdown: string) => void
  placeholder?: string
  className?: string
}

const MarkdownNoteEditor = ({ 
  content, 
  onChange, 
  placeholder = "Escribe tu nota en Markdown...",
  className = ""
}: MarkdownNoteEditorProps) => {
  return (
    <div className={`w-full ${className}`}>
      <MDXEditor
        markdown={content}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose prose-lg max-w-none focus:outline-none 
          prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground 
          prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground
          prose-h1:text-4xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8
          prose-h2:text-3xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:mt-6  
          prose-h3:text-2xl prose-h3:font-medium prose-h3:mb-3 prose-h3:mt-5
          prose-h4:text-xl prose-h4:font-medium prose-h4:mb-2 prose-h4:mt-4
          prose-blockquote:border-l-4 prose-blockquote:border-primary 
          prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground
          prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-code:font-mono
          prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:mb-4 prose-pre:overflow-x-auto
          prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border prose-table:mb-6
          prose-th:border prose-th:border-border prose-th:px-4 prose-th:py-3 prose-th:bg-muted prose-th:font-semibold prose-th:text-left
          prose-td:border prose-td:border-border prose-td:px-4 prose-td:py-3
          prose-a:text-primary prose-a:no-underline hover:prose-a:underline
          min-h-[50vh] p-6 text-foreground"
        plugins={[
          // Core functionality
          headingsPlugin(),
          listsPlugin(),
          markdownShortcutPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          
          // Links and images
          linkPlugin(),
          linkDialogPlugin({
            linkAutocompleteSuggestions: []
          }),
          imagePlugin({
            imageUploadHandler: async (file: File) => {
              // Convertir imagen a base64 para almacenamiento local
              return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                  const result = e.target?.result;
                  if (typeof result === 'string') {
                    resolve(result);
                  } else {
                    reject(new Error('Error al procesar la imagen'));
                  }
                };
                reader.onerror = () => reject(new Error('Error al leer el archivo'));
                reader.readAsDataURL(file);
              });
            }
          }),
          
          // Tables
          tablePlugin(),
          
          // Code blocks
          codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
          codeMirrorPlugin({ 
            codeBlockLanguages: {
              js: 'JavaScript',
              javascript: 'JavaScript',
              ts: 'TypeScript',
              typescript: 'TypeScript',
              python: 'Python',
              css: 'CSS',
              html: 'HTML',
              json: 'JSON',
              sql: 'SQL',
              bash: 'Bash',
              markdown: 'Markdown'
            }
          }),
          
          // Advanced features
          frontmatterPlugin(),
          directivesPlugin({
            directiveDescriptors: [AdmonitionDirectiveDescriptor]
          }),
          
          // Toolbar
          toolbarPlugin({
            toolbarContents: () => (
              <div className="flex items-center gap-1 p-2 bg-muted/50 border-b border-border">
                <UndoRedo />
                <div className="w-px h-6 bg-border mx-2" />
                <BoldItalicUnderlineToggles />
                <div className="w-px h-6 bg-border mx-2" />
                <BlockTypeSelect />
                <div className="w-px h-6 bg-border mx-2" />
                <CreateLink />
                <InsertTable />
                <div className="w-px h-6 bg-border mx-2" />
                <InsertCodeBlock />
                <InsertThematicBreak />
                <div className="w-px h-6 bg-border mx-2" />
                <ListsToggle />
              </div>
            )
          })
        ]}
        className="border border-border rounded-lg overflow-hidden bg-card"
      />
    </div>
  )
}

export default MarkdownNoteEditor