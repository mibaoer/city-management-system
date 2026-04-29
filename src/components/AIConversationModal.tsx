import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Mic, MicOff } from 'lucide-react';

// 消息类型定义
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// AI对话模态框组件
interface AIConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardData?: {
    totalTasks?: number;
    pendingTasks?: number;
    completionRate?: number;
    eventCount?: number;
    rectificationRate?: number;
    acceptanceRate?: number;
    totalPersonnel?: number;
    onlinePersonnel?: number;
    busyPersonnel?: number;
    currentTasks?: number;
  };
}

const AIConversationModal: React.FC<AIConversationModalProps> = ({ 
  isOpen, 
  onClose, 
  dashboardData = {}
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '您好！我是智能助手，请问有什么可以帮助您的？',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // 滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化语音识别
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript); // 直接替换输入，而不是追加
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('语音识别错误:', event.error);
        let errorMessage = '语音识别出错';
        
        // 根据错误类型提供更具体的错误信息
        switch (event.error) {
          case 'not-allowed':
            errorMessage = '语音识别权限被拒绝，请在浏览器设置中允许麦克风访问';
            break;
          case 'no-speech':
            errorMessage = '未检测到语音输入';
            break;
          case 'audio-capture':
            errorMessage = '无法访问麦克风';
            break;
          case 'network':
            errorMessage = '网络错误导致语音识别失败';
            break;
          case 'bad-grammar':
            errorMessage = '语音识别语法错误';
            break;
          case 'language-not-supported':
            errorMessage = '不支持的语言';
            break;
        }
        
        // 添加一个AI消息来显示错误
        const errorMessageObj: Message = {
          id: (Date.now() + 2).toString(),
          content: errorMessage,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessageObj]);
        
        setIsListening(false);
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        // 添加一个AI消息来提示用户开始说话
        const promptMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '请开始说话...',
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, promptMessage]);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // 切换语音识别状态
  const toggleSpeechRecognition = () => {
    // 重新检查浏览器支持，确保每次点击都能正确初始化
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能，请使用Chrome浏览器尝试');
      return;
    }

    // 如果还没有初始化，重新初始化
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('语音识别错误:', event.error);
        let errorMessage = '语音识别出错';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = '语音识别权限被拒绝，请在浏览器设置中允许麦克风访问';
            break;
          case 'no-speech':
            errorMessage = '未检测到语音输入';
            break;
          case 'audio-capture':
            errorMessage = '无法访问麦克风';
            break;
          case 'network':
            errorMessage = '网络错误导致语音识别失败';
            break;
        }
        
        const errorMessageObj: Message = {
          id: (Date.now() + 2).toString(),
          content: errorMessage,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessageObj]);
        
        setIsListening(false);
      };

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        const promptMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: '请开始说话...',
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, promptMessage]);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('启动语音识别失败:', error);
        alert('启动语音识别失败，请检查浏览器权限设置');
        setIsListening(false);
      }
    }
  };

  // 生成AI回复
  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // 提取数据
    const { 
      totalTasks = 586, 
      pendingTasks = 89, 
      completionRate = 92, 
      eventCount = 185, 
      rectificationRate = 94.2, 
      acceptanceRate = 91.5,
      totalPersonnel = 7,
      onlinePersonnel = 5,
      busyPersonnel = 2,
      currentTasks = 56
    } = dashboardData;

    // 回答常见问题
    if (message.includes('任务总数') || message.includes('总任务')) {
      return `今日任务总数是 ${totalTasks} 个。`;
    } else if (message.includes('待处理') || message.includes('未处理')) {
      return `待处理问题有 ${pendingTasks} 个。`;
    } else if (message.includes('完成率')) {
      return `完成率是 ${completionRate}%。`;
    } else if (message.includes('事件数')) {
      return `事件数是 ${eventCount} 件。`;
    } else if (message.includes('整改率')) {
      return `整改率是 ${rectificationRate}%。`;
    } else if (message.includes('验收率')) {
      return `验收率是 ${acceptanceRate}%。`;
    } else if (message.includes('总人员') || message.includes('人员总数')) {
      return `总人员是 ${totalPersonnel} 人。`;
    } else if (message.includes('在线人员')) {
      return `在线人员是 ${onlinePersonnel} 人。`;
    } else if (message.includes('忙碌人员')) {
      return `忙碌人员是 ${busyPersonnel} 人。`;
    } else if (message.includes('当前任务')) {
      return `当前任务是 ${currentTasks} 个。`;
    } else if (message.includes('你好') || message.includes('您好')) {
      return '您好！我是智能助手，请问有什么可以帮助您的？';
    } else if (message.includes('谢谢') || message.includes('感谢')) {
      return '不客气！随时为您服务。';
    } else {
      return '抱歉，我不太理解您的问题。您可以尝试问我关于大屏数据的问题，比如"今日任务总数是多少？"、"待处理问题有多少？"等。';
    }
  };

  // 发送消息
  const handleSendMessage = () => {
    if (!input.trim()) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // 模拟AI回复延迟
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(input.trim()),
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#0e2a47] to-[#0a1f3a] rounded-2xl border-2 border-[#7b61ff] shadow-2xl shadow-[#7b61ff]/30 overflow-hidden">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1e4976] to-[#0e2a47] border-b border-[#7b61ff]/30">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-[#7b61ff]" />
            <h2 className="text-lg font-bold text-white">AI智能助手</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-gray-400 hover:bg-[#1e4976] hover:text-white transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 对话内容区域 */}
        <div className="flex-1 p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${message.sender === 'user' 
                    ? 'bg-gradient-to-br from-[#7b61ff] to-[#a78bfa] text-white' 
                    : 'bg-[#1e4976] text-white border border-[#7b61ff]/30'}`}
                >
                  <p className="text-sm">{message.content}</p>
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString('zh-CN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="p-4 border-t border-[#7b61ff]/30 bg-[#081c2f]">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-full ${isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-[#1e4976] text-gray-400 hover:bg-[#7b61ff] hover:text-white'} transition-colors`}
              aria-label={isListening ? '停止语音输入' : '开始语音输入'}
              title={isListening ? '停止语音输入' : '开始语音输入'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入您的问题，或点击麦克风进行语音输入..."
              className="flex-1 px-4 py-2 bg-[#0a1f3a] border border-[#7b61ff]/30 rounded-full text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7b61ff]"
            />
            <button
              onClick={handleSendMessage}
              className="p-2 rounded-full bg-gradient-to-br from-[#7b61ff] to-[#a78bfa] text-white hover:shadow-lg hover:shadow-[#7b61ff]/50 transition-all"
              aria-label="发送"
              title="发送"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIConversationModal;