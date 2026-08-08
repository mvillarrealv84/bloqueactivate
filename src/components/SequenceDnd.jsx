import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function SequenceDnd({ options, isInteractive, value, onChange, showResult }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (value && value.length > 0) {
      setItems(value.map(v => ({ id: v, content: v })));
    } else {
      setItems(options.map(opt => ({ id: opt, content: opt })));
    }
  }, [options, value]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (!isInteractive) return;

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
    onChange(newItems.map(i => i.content));
  };

  // If not interactive, just show the dashed empty boxes
  if (!isInteractive) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
        {options && options.length > 0 ? (
          options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '40px', height: '40px', border: '2px dashed #999', flexShrink: 0, borderRadius: '4px' }}></div>
              <div style={{ fontSize: '1.1rem', background: '#f5f5f5', padding: '10px', borderRadius: '4px', flex: 1, border: '1px solid #ddd' }}>{opt}</div>
            </div>
          ))
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, height: '80px', border: '2px dashed #ccc' }}></div>
            <div style={{ flex: 1, height: '80px', border: '2px dashed #ccc' }}></div>
            <div style={{ flex: 1, height: '80px', border: '2px dashed #ccc' }}></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="sequence-droppable">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      opacity: showResult ? 0.8 : 1,
                      pointerEvents: showResult ? 'none' : 'auto'
                    }}
                  >
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      background: snapshot.isDragging ? '#FCE029' : '#fff',
                      border: '2px solid #999', 
                      flexShrink: 0, 
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      cursor: 'grab'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ 
                      fontSize: '1.1rem', 
                      background: snapshot.isDragging ? '#fffae6' : '#fff', 
                      padding: '10px', 
                      borderRadius: '4px', 
                      flex: 1, 
                      border: '1px solid #ddd',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {item.content}
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
