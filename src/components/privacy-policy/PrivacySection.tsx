// src/components/privacy-policy/PrivacySection.tsx
"use client";

interface PrivacySectionProps {
  id: string;
  title: string;
  content: string | any;
  isActive: boolean;
}

export default function PrivacySection({
  id,
  title,
  content,
  isActive
}: PrivacySectionProps) {
  // Convert content to string if it's not already
  let contentString = typeof content === 'string' ? content : String(content);
  
  // Function to process the content and convert to proper HTML
  const processContent = (text: string) => {
    // Split by double newlines to get paragraphs
    const paragraphs = text.split('\n\n');
    
    return paragraphs.map(paragraph => {
      // Check if this paragraph contains a numbered list (e.g., "1. ")
      if (/^\d+\.\s/.test(paragraph)) {
        // It's a numbered list item
        const lines = paragraph.split('\n');
        let html = '<ol class="list-decimal ml-5 mb-4">';
        
        lines.forEach(line => {
          const match = line.match(/^(\d+)\.\s(.+)$/);
          if (match) {
            // Check if the content has a strong tag with colon
            const [, number, content] = match;
            if (content.includes('</strong>:')) {
              // Split at the colon to put description on new line
              const [title, ...rest] = content.split('</strong>:');
              html += `<li class="mb-2">${title}</strong>:<br/>${rest.join(':').trim()}</li>`;
            } else {
              html += `<li class="mb-2">${content}</li>`;
            }
          }
        });
        
        html += '</ol>';
        return html;
      }
      
      // Check if this paragraph contains bullet points
      if (paragraph.includes('\n•')) {
        const lines = paragraph.split('\n');
        let html = '';
        let inList = false;
        
        lines.forEach(line => {
          if (line.startsWith('•')) {
            if (!inList) {
              html += '<ul class="list-disc ml-5 mb-4">';
              inList = true;
            }
            html += `<li class="mb-1">${line.substring(1).trim()}</li>`;
          } else {
            if (inList) {
              html += '</ul>';
              inList = false;
            }
            if (line.includes('<strong>') && line.endsWith(':</strong>')) {
              // This is a section header - add margin
              html += `<p class="font-semibold mt-4 mb-2">${line}</p>`;
            } else if (line.trim()) {
              html += `<p class="mb-2">${line}</p>`;
            }
          }
        });
        
        if (inList) {
          html += '</ul>';
        }
        
        return html;
      }
      
      // Regular paragraph
      if (paragraph.includes('<strong>') && paragraph.includes(':</strong>')) {
        // Split numbered items with strong tags
        const items = paragraph.split(/(?=\d+\.\s*<strong>)/);
        return items.map(item => {
          if (item.trim()) {
            // Add line break after closing strong tag with colon
            const processed = item.replace(':</strong>', ':</strong><br/>');
            return `<p class="mb-3">${processed}</p>`;
          }
          return '';
        }).join('');
      }
      
      return `<p class="mb-4">${paragraph}</p>`;
    }).join('');
  };
  
  const processedContent = processContent(contentString);
  
  return (
    <div
      id={id}
      className={`bg-white rounded-xl p-6 shadow-sm transition-all duration-300 ${
        isActive ? "ring-2 ring-[#118B50] shadow-lg" : ""
      }`}
    >
      <h2 className="text-2xl font-bold text-[#118B50] mb-4">{title}</h2>
      <div 
        className="prose prose-gray max-w-none [&_strong]:font-semibold [&_strong]:text-gray-900"
        dangerouslySetInnerHTML={{ 
          __html: processedContent
        }}
      />
    </div>
  );
}