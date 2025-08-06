import type { TNode, TText } from 'react-native-render-html';

export function isTText(node: TNode): node is TText {
  return node.type === 'text';
}

export function isTElement(node: TNode): node is TNode & { tagName: string; children: TNode[] } {
  return (
    node.type !== 'text' &&
    'tagName' in node &&
    typeof (node as any).tagName === 'string' &&
    Array.isArray((node as any).children)
  );
}

export function extractTextFromTNode(node: TNode): string {
  if (isTText(node)) {
    return node.data || '';
  }
  if (isTElement(node) && node.children) {
    return node.children.map(extractTextFromTNode).join('');
  }
  return '';
}
