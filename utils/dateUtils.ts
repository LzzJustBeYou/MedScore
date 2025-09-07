export const formatDateTime = (dateString: string | undefined): string => {
    if (!dateString) return '未知';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      console.error('时间格式化错误:', error);
      return '时间格式错误';
    }
  };
  
  export const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '未知';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      console.error('日期格式化错误:', error);
      return '日期格式错误';
    }
  };