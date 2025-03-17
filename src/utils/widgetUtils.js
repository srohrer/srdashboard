import React from 'react';
import ExampleWidget from '../components/ExampleWidget';
import TextboxWidget from '../components/TextboxWidget';
import IconWidget from '../components/IconWidget';
import TodoWidget from '../components/TodoWidget';
import SentimentAnalysisWidget from '../components/SentimentAnalysisWidget';

/**
 * Returns the appropriate width for a widget based on its type
 * @param {string} type - The widget type
 * @returns {string} - The width value
 */
export const getWidgetWidth = (type) => {
  switch (type) {
    case 'icon':
      return '70px'; // Smaller width for icon widgets
    default:
      return '300px'; // Default width for all other widgets
  }
};

/**
 * Renders the appropriate widget component based on its type
 * @param {Object} widget - The widget data object
 * @param {function} onContentChange - Callback for content changes
 * @returns {React.ReactElement} - The rendered widget component
 */
export const renderWidgetContent = (widget, onContentChange) => {
  switch (widget.type) {
    case 'example':
      return <ExampleWidget widgetId={widget.id} />;
    case 'icon':
      return (
        <IconWidget
          content={widget.content || 'ArrowUpward'}
          onContentChange={onContentChange}
          widgetId={widget.id}
        />
      );
    case 'textbox':
      return (
        <TextboxWidget 
          content={widget.content || ''} 
          onContentChange={onContentChange}
          widgetId={widget.id}
        />
      );
    case 'todo':
      return (
        <TodoWidget
          content={widget.content || '{"title":"Todo List","todos":[]}'}
          onContentChange={onContentChange}
          widgetId={widget.id}
        />
      );
    case 'sentiment':
      return (
        <SentimentAnalysisWidget
          content={widget.content || ''} 
          onContentChange={onContentChange}
          widgetId={widget.id}
        />
      );
    default:
      return <React.Fragment>Widget Content</React.Fragment>;
  }
};

/**
 * Renders the appropriate widget preview for drag overlay
 * @param {string} widgetType - The widget type
 * @returns {React.ReactElement} - The rendered preview component
 */
export const renderDragPreview = (widgetType) => {
  switch (widgetType) {
    case 'textbox':
      return <TextboxWidget />;
    case 'icon':
      return <IconWidget />;
    case 'example':
      return <ExampleWidget />;
    case 'todo':
      return <TodoWidget content='{"title":"Todo List","todos":[]}' />;
    case 'sentiment':
      return <SentimentAnalysisWidget />;
    default:
      return <ExampleWidget />;
  }
}; 