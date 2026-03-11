import { useState, useEffect, useRef } from 'react';

declare global {
    interface Window {
        CKEDITOR: any;
    }
}

interface EditTemplateProps {
    template: any;
    onBack: () => void;
    onSave: (updatedTemplate: any) => void;
}

export default function EditTemplate({ template, onBack, onSave }: EditTemplateProps) {
    const [title, setTitle] = useState(template.title);
    const [subject, setSubject] = useState(template.subject);
    const editorRef = useRef<any>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const [editorLoaded, setEditorLoaded] = useState(false);

    // Load CKEditor 4 from CDN
    useEffect(() => {
        const scriptId = 'ckeditor4-cdn';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        const initEditor = () => {
            if (window.CKEDITOR && document.getElementById('templateEditor') && !editorRef.current) {
                // Remove any old instance that might exist
                if (window.CKEDITOR.instances['templateEditor']) {
                    window.CKEDITOR.instances['templateEditor'].destroy(true);
                }
                
                const editor = window.CKEDITOR.replace('templateEditor', {
                    height: 400,
                    allowedContent: true,
                    fullPage: false,
                    removeButtons: '',
                    removePlugins: 'exportpdf',
                    toolbarGroups: [
                        { name: 'document', groups: ['mode', 'document', 'doctools'] },
                        { name: 'clipboard', groups: ['clipboard', 'undo'] },
                        { name: 'editing', groups: ['find', 'selection', 'spellchecker'] },
                        { name: 'forms' },
                        '/',
                        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
                        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi'] },
                        { name: 'links' },
                        { name: 'insert' },
                        '/',
                        { name: 'styles' },
                        { name: 'colors' },
                        { name: 'tools' },
                        { name: 'others' },
                        { name: 'about' }
                    ],
                });
                
                editorRef.current = editor;

                // Only set data once the instance is truly ready
                editor.on('instanceReady', () => {
                    if (template.content) {
                        editor.setData(template.content);
                    }
                    setEditorLoaded(true);
                });
            }
        };

        const tryInit = () => {
            // Need a tiny timeout to let React flush the DOM
            setTimeout(initEditor, 100);
        };

        if (!script) {
            script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdn.ckeditor.com/4.22.1/full/ckeditor.js';
            script.onload = tryInit;
            document.head.appendChild(script);
        } else if (window.CKEDITOR) {
            tryInit();
        } else {
            script.addEventListener('load', tryInit);
        }

        return () => {
            if (editorRef.current) {
                try {
                    editorRef.current.destroy(true);
                } catch (e) {
                    console.error('Error destroying CKEditor:', e);
                }
                editorRef.current = null;
            }
        };
    }, [template.id]);

    const handleSubmit = () => {
        let content = '';
        if (editorRef.current) {
            content = editorRef.current.getData();
        }
        onSave({ ...template, title, subject, content });
    };

    return (
        <div className="edit-template-page">
            <div className="cat-header-container">
                <h1 className="cat-page-title" style={{ textTransform: 'uppercase' }}>{template.subject !== undefined ? 'MANAGE TEMPLATE' : 'MANAGE PAGE'}</h1>
                <div className="cat-breadcrumb">
                    <span onClick={onBack} style={{ cursor: 'pointer' }}>{template.subject !== undefined ? 'Emails' : 'Pages'}</span> <span className="cat-bc-sep">›</span> <span>{template.subject !== undefined ? 'Manage Template' : 'Manage Page'}</span>
                </div>
            </div>

            <div className="et-card">
                <div className="et-form-grid">
                    <div className="et-form-group" style={{ gridColumn: template.subject !== undefined ? 'span 1' : 'span 2' }}>
                        <label>Title</label>
                        <input
                            type="text"
                            className="et-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    {template.subject !== undefined && (
                        <div className="et-form-group">
                            <label>Subject</label>
                            <input
                                type="text"
                                className="et-input"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="et-editor-section">
                    <label>Content</label>
                    <div ref={editorContainerRef}>
                        <textarea
                            id="templateEditor"
                            defaultValue={template.content || ''}
                            style={{ visibility: editorLoaded ? 'visible' : 'hidden' }}
                        />
                    </div>
                    {!editorLoaded && (
                        <div className="et-editor-loading">Loading editor...</div>
                    )}
                </div>

                <div className="et-actions">
                    <button className="et-submit-btn" onClick={handleSubmit}>
                        Submit
                    </button>
                </div>
            </div>

            <footer className="profile-footer" style={{ marginTop: '20px' }}>
                2026 © TV19.
            </footer>
        </div>
    );
}
