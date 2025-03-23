import React, { Fragment } from "react";
import {
  P,
  Article,
  H1,
  H2,
  H3,
  UL,
  LI,
  Strong,
  EM,
  A,
} from "@expo/html-elements";

/**
 * Decodes HTML entities like &nbsp; to their actual characters.
 * Essential for proper rendering of content with HTML entities.
 * This implementation is platform-agnostic and works in both web and React Native.
 *
 * @param html - String containing HTML entities to decode
 * @returns String with decoded HTML entities
 */
const decodeHtmlEntities = (html: string): string => {
  if (!html) return "";

  // Common HTML entities mapping
  const htmlEntities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&cent;": "¢",
    "&pound;": "£",
    "&yen;": "¥",
    "&euro;": "€",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
    "&deg;": "°",
    "&middot;": "·",
    "&bull;": "•",
    "&hellip;": "…",
    "&ndash;": "–",
    "&mdash;": "—",
    // Additional entities
    "&ensp;": " ", // en space
    "&emsp;": " ", // em space
    "&thinsp;": " ", // thin space
    "&zwnj;": "", // zero width non-joiner
    "&zwj;": "", // zero width joiner
    "&lrm;": "", // left-to-right mark
    "&rlm;": "", // right-to-left mark
    "&sbquo;": "‚", // single low-9 quotation mark
    "&ldquo;": '"', // left double quotation mark
    "&rdquo;": '"', // right double quotation mark
    "&lsquo;": "'", // left single quotation mark
    "&rsquo;": "'", // right single quotation mark
    "&laquo;": "«", // left-pointing double angle quotation mark
    "&raquo;": "»", // right-pointing double angle quotation mark
  };

  // Replace all HTML entities with their corresponding characters
  let decodedText = html;

  // First handle the named entities
  Object.entries(htmlEntities).forEach(([entity, char]) => {
    const regex = new RegExp(entity, "g");
    decodedText = decodedText.replace(regex, char);
  });

  // Then handle numeric entities
  decodedText = decodedText.replace(/&#(\d+);/g, (_, code) => {
    return String.fromCharCode(parseInt(code, 10));
  });

  // Handle hex entities
  decodedText = decodedText.replace(/&#x([0-9a-f]+);/gi, (_, code) => {
    return String.fromCharCode(parseInt(code, 16));
  });

  return decodedText;
};

/**
 * Normalizes text formatting by standardizing newlines and removing excess whitespace
 * Creates a consistent format for processing content regardless of input style
 *
 * @param text - Text to normalize
 * @returns Normalized text
 */
const normalizeTextFormatting = (text: string): string => {
  if (!text) return "";

  return (
    text
      // Standardize line endings
      .replace(/\r\n|\r/g, "\n")
      // Remove more than 2 consecutive line breaks
      .replace(/\n{3,}/g, "\n\n")
      // Remove leading/trailing whitespace on each line
      .split("\n")
      .map((line) => line.trim())
      .join("\n")
      // Remove leading/trailing whitespace from entire text
      .trim()
  );
};

/**
 * Custom component to render HTML content from markdown or HTML text.
 * Uses @expo/html-elements to render semantic HTML on both web and native platforms.
 * This provides better accessibility and SEO compared to plain React Native components.
 *
 * @param content - The markdown or HTML formatted string to render
 */
export const HtmlRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  // Normalize text and decode HTML entities
  const normalizedContent = normalizeTextFormatting(content);
  const decodedContent = decodeHtmlEntities(normalizedContent);

  // Check if content contains HTML tags
  const containsHtml = /<\/?[a-z][\s\S]*>/i.test(decodedContent);

  /**
   * Parses HTML content and converts it to React components
   * This handles common HTML tags in plant descriptions
   */
  const parseHtmlContent = (): React.ReactNode => {
    // Clean up any double line breaks or excessive whitespace
    let cleanContent = decodedContent.trim().replace(/\n\s*\n/g, "\n\n");

    // First handle paragraph tags
    let hasExplicitParagraphs = cleanContent.includes("<p>");

    // If there are no paragraph tags but there are line breaks, wrap sections in paragraphs
    if (!hasExplicitParagraphs && cleanContent.includes("\n\n")) {
      // Split by double line breaks and wrap each section in paragraph tags
      cleanContent = cleanContent
        .split("\n\n")
        .map((section) => section.trim())
        .filter(Boolean)
        .map((section) => `<p>${section}</p>`)
        .join("");

      hasExplicitParagraphs = true;
    }

    // If there are still no paragraphs, wrap the whole content in a paragraph
    if (!hasExplicitParagraphs) {
      cleanContent = `<p>${cleanContent}</p>`;
    }

    // Replace <p> tags with proper components
    let blocks: React.ReactNode[] = [];

    // Extract and process paragraphs
    const paragraphRegex = /<p>([\s\S]*?)<\/p>/g;
    let match;
    let lastIndex = 0;

    while ((match = paragraphRegex.exec(cleanContent)) !== null) {
      // If there's content before the match that wasn't in a paragraph
      if (match.index > lastIndex) {
        const untaggedContent = cleanContent
          .substring(lastIndex, match.index)
          .trim();
        if (untaggedContent) {
          blocks.push(
            <P key={`p-${blocks.length}`} className="text-cream-800 mb-3">
              {parseInlineHtml(untaggedContent)}
            </P>
          );
        }
      }

      // Add the paragraph
      const paragraphContent = match[1].trim();
      if (paragraphContent) {
        blocks.push(
          <P key={`p-${blocks.length}`} className="text-cream-800 mb-3">
            {parseInlineHtml(paragraphContent)}
          </P>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // If there's any remaining content after the last paragraph
    if (lastIndex < cleanContent.length) {
      const remainingContent = cleanContent.substring(lastIndex).trim();
      if (remainingContent) {
        blocks.push(
          <P key={`p-${blocks.length}`} className="text-cream-800 mb-3">
            {parseInlineHtml(remainingContent)}
          </P>
        );
      }
    }

    return blocks.length > 0 ? (
      blocks
    ) : (
      <P className="text-cream-800 mb-3">{parseInlineHtml(cleanContent)}</P>
    );
  };

  /**
   * Parse inline HTML tags like <strong>, <em>, <a>
   * @param text - The HTML text to parse
   */
  const parseInlineHtml = (text: string): React.ReactNode[] => {
    // Normalize whitespace first
    const normalizedText = text.replace(/\s+/g, " ").trim();
    let segments: React.ReactNode[] = [normalizedText];

    // Process <b> and <strong> tags (both are common in HTML)
    segments = processHtmlTag(
      segments,
      /<(strong|b)>(.*?)<\/\1>/g,
      (content) => <Strong>{content}</Strong>
    );

    // Process <i> and <em> tags
    segments = processHtmlTag(segments, /<(em|i)>(.*?)<\/\1>/g, (content) => (
      <EM>{content}</EM>
    ));

    // Process <a> tags with href
    segments = processHtmlTag(
      segments,
      /<a href="(.*?)".*?>(.*?)<\/a>/g,
      (content, url) => (
        <A href={url} className="text-brand-600 underline">
          {content}
        </A>
      ),
      true
    );

    // Process <a> tags without href but with other attributes
    segments = processHtmlTag(segments, /<a [^>]*?>(.*?)<\/a>/g, (content) => (
      <A className="text-brand-600 underline">{content}</A>
    ));

    // Process basic <a> tags without attributes
    segments = processHtmlTag(segments, /<a>(.*?)<\/a>/g, (content) => (
      <A className="text-brand-600 underline">{content}</A>
    ));

    // Process <br> tags (convert to spaces)
    segments = segments.map((segment) => {
      if (typeof segment === "string") {
        return segment.replace(/<br\s*\/?>/gi, " ");
      }
      return segment;
    });

    // Also process markdown since some content might mix formats
    segments = processFormattedText(segments, /\*\*(.*?)\*\*/g, (content) => (
      <Strong>{content}</Strong>
    ));

    segments = processFormattedText(segments, /\*(.*?)\*/g, (content) => (
      <EM>{content}</EM>
    ));

    segments = processFormattedText(
      segments,
      /\[(.*?)\]\((.*?)\)/g,
      (linkText, linkUrl) => (
        <A href={linkUrl} className="text-brand-600 underline">
          {linkText}
        </A>
      )
    );

    return segments;
  };

  /**
   * Helper function to process HTML tags with regex
   * Similar to processFormattedText but specifically for HTML tags
   */
  const processHtmlTag = (
    segments: React.ReactNode[],
    regex: RegExp,
    formatter: (match: string, group2?: string) => React.ReactNode,
    hasMultipleGroups = false
  ): React.ReactNode[] => {
    const result: React.ReactNode[] = [];

    segments.forEach((segment) => {
      // Skip already processed React elements
      if (typeof segment !== "string") {
        result.push(segment);
        return;
      }

      const textContent = segment as string;
      let lastIndex = 0;
      let match;

      // Reset regex lastIndex
      regex.lastIndex = 0;

      while ((match = regex.exec(textContent)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          result.push(textContent.substring(lastIndex, match.index));
        }

        // Format the matched content
        // For <tag>content</tag> patterns, match[1] is the tag name and match[2] is the content
        const formattedContent = hasMultipleGroups
          ? formatter(match[2], match[1]) // For tags with attributes like <a href="...">
          : formatter(match[2]); // For simple tags like <strong>, use match[2] for the content

        result.push(
          <Fragment key={`html-${result.length}`}>{formattedContent}</Fragment>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < textContent.length) {
        result.push(textContent.substring(lastIndex));
      }
    });

    return result.length > 0 ? result : segments;
  };

  // Process the content to handle basic markdown
  const processContent = () => {
    // Split content into blocks (paragraphs, lists, etc.)
    const blocks = decodedContent
      .split("\n\n")
      .filter((block) => block.trim() !== "");

    return blocks.map((block, blockIndex) => {
      // Check if block is a heading
      if (block.startsWith("# ")) {
        return (
          <H1
            key={blockIndex}
            className="text-xl font-bold text-cream-800 mb-2"
          >
            {block.substring(2)}
          </H1>
        );
      }

      if (block.startsWith("## ")) {
        return (
          <H2
            key={blockIndex}
            className="text-lg font-bold text-cream-800 mb-2"
          >
            {block.substring(3)}
          </H2>
        );
      }

      if (block.startsWith("### ")) {
        return (
          <H3
            key={blockIndex}
            className="text-base font-bold text-cream-800 mb-2"
          >
            {block.substring(4)}
          </H3>
        );
      }

      // Check if block is a list
      if (block.match(/^[-*] /m)) {
        const items = block.split("\n").filter((line) => line.match(/^[-*] /));
        return (
          <UL key={blockIndex} className="mb-3 ml-4">
            {items.map((item, itemIndex) => (
              <LI key={itemIndex} className="text-cream-800 mb-1">
                {processInlineMarkdown(item.substring(2))}
              </LI>
            ))}
          </UL>
        );
      }

      // Regular paragraph
      return (
        <P key={blockIndex} className="text-cream-800 mb-3">
          {processInlineMarkdown(block)}
        </P>
      );
    });
  };

  /**
   * Process inline markdown elements like bold, italic, and links
   * @param text - The text to process for inline markdown
   */
  const processInlineMarkdown = (text: string) => {
    // Create a structure to hold the processed text segments and formatting
    let textSegments: React.ReactNode[] = [text];

    // Process bold text (**text**)
    textSegments = processFormattedText(
      textSegments,
      /\*\*(.*?)\*\*/g,
      (content) => <Strong>{content}</Strong>
    );

    // Process italic text (*text*)
    textSegments = processFormattedText(
      textSegments,
      /\*(.*?)\*/g,
      (content) => <EM>{content}</EM>
    );

    // Process links [text](url)
    textSegments = processFormattedText(
      textSegments,
      /\[(.*?)\]\((.*?)\)/g,
      (linkText, linkUrl) => (
        <A href={linkUrl} className="text-brand-600 underline">
          {linkText}
        </A>
      )
    );

    return textSegments;
  };

  /**
   * Helper function to process formatted text with regex
   * @param segments - Current text segments
   * @param regex - Regex pattern to find
   * @param formatter - Function to format matches
   */
  const processFormattedText = (
    segments: React.ReactNode[],
    regex: RegExp,
    formatter: (match: string, group2?: string) => React.ReactNode
  ): React.ReactNode[] => {
    const result: React.ReactNode[] = [];

    segments.forEach((segment) => {
      // Skip already processed React elements
      if (typeof segment !== "string") {
        result.push(segment);
        return;
      }

      const textContent = segment as string;
      let lastIndex = 0;
      let match;

      // Reset regex lastIndex
      regex.lastIndex = 0;

      while ((match = regex.exec(textContent)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          result.push(textContent.substring(lastIndex, match.index));
        }

        // Format the matched content
        const formattedContent = match[2]
          ? formatter(match[1], match[2]) // For patterns with two capture groups like links
          : formatter(match[1]); // For patterns with one capture group

        result.push(
          <Fragment key={`formatted-${result.length}`}>
            {formattedContent}
          </Fragment>
        );

        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < textContent.length) {
        result.push(textContent.substring(lastIndex));
      }
    });

    return result.length > 0 ? result : segments;
  };

  // Choose rendering method based on content type
  return (
    <Article className="text-cream-800">
      {containsHtml ? parseHtmlContent() : processContent()}
    </Article>
  );
};
