export function appendPendingTurn(messages, { assistantId, createdAt, text, userId }) {
  return [
    ...messages,
    {
      id: userId,
      role: 'user',
      content: text,
      createdAt,
      status: 'complete',
      requestId: null,
      diagnostics: null,
      errorStage: null,
      errorCode: null,
    },
    {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt,
      status: 'pending',
      requestId: null,
      diagnostics: null,
      errorStage: null,
      errorCode: null,
    },
  ];
}

export function settleAssistantMessage(messages, assistantId, result, createdAt) {
  return messages.map((message) => message.id === assistantId
    ? {
      ...message,
      content: result.reply,
      createdAt,
      status: 'complete',
      requestId: result.requestId,
      diagnostics: result.diagnostics,
    }
    : message);
}

export function failAssistantMessage(messages, assistantId, error, createdAt) {
  return messages.map((message) => message.id === assistantId
    ? {
      ...message,
      content: error.message,
      createdAt,
      status: 'error',
      requestId: error.requestId || null,
      diagnostics: null,
      errorStage: error.errorStage || null,
      errorCode: error.errorCode || null,
    }
    : message);
}
