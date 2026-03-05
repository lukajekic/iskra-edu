import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

export default function RichTextEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: "<p>Počni da pišeš...</p>",
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex gap-2 mb-3">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullet List
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          Ordered List
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}