import mammoth from 'mammoth';

/**
 * Read plain text content from a .doc, .docx, or .pdf File object (browser)
 * @param file File object (.docx or .pdf)
 * @returns Promise<string> The plain text content
 */
export async function readTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    // @ts-ignore
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } else if (ext === 'txt') {
    const text = await file.text();
    return text;
  } else if (ext === 'doc') {
    throw new Error('.doc format is not directly supported. Please convert to .docx.');
  } else {
    throw new Error('Only .docx, .doc, and .txt files are supported.');
  }
}