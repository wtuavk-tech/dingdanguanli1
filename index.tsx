import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { 
  Copy, 
  FileText, 
  CheckCircle, 
  Info, 
  Search, 
  AlertTriangle, 
  Trash2, 
  DollarSign, 
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Upload,
  Image as ImageIcon,
  Calendar,
  MessageCircle,
  Send,
  Smile,
  Video,
  Paperclip,
  User,
  ListFilter,
  SlidersHorizontal,
  Activity,
  Zap,
  LayoutDashboard,
  Wallet,
  ClipboardList,
  Megaphone,
  Bell,
  Check,
  Users,
  Settings,
  MapPin,
  Clock,
  Tag,
  Eye,
  Phone
} from 'lucide-react';

// --- 类型定义 ---

enum OrderStatus {
  PendingDispatch = '待派单',
  Completed = '已完成',
  Void = '作废',
  Returned = '已退回',
  Error = '报错'
}

interface Order {
  id: number;
  orderNo: string;
  workOrderNo: string;
  dispatchTime: string;
  mobile: string;
  serviceItem: string;
  serviceRatio: '3:7' | '2:8' | '4:6'; 
  status: OrderStatus;
  returnReason?: string; 
  errorDetail?: string; 
  region: string;
  address: string;
  details: string;
  recordTime: string;
  source: string;
  totalAmount: number;
  cost: number;
  hasAdvancePayment: boolean; 
  depositAmount?: number;
  weightedCoefficient: number;
  regionPeople: number;
  isReminded: boolean;
  suggestedMethod: string; // 建议方式
  guidePrice: number;      // 划线价
  historicalPrice: string; // 历史价 (改为字符串区间)

  // --- 新增字段 ---
  hasCoupon: boolean;      // 是否有券
  isCouponVerified: boolean; // 是否验券
  isRead: boolean;         // 是否已读
  isCalled: boolean;       // 是否拨打
  warrantyPeriod: string;  // 质保期
  workPhone: string;       // 工作机
  customerName: string;    // 客户姓名
  dispatcherName: string;  // 派单员
  recorderName: string;    // 录单员
  masterName: string;      // 师傅
  totalReceipt: number;    // 总收款
  // cost 已存在
  revenue: number;         // 业绩
  actualPaid: number;      // 实付金额
  advancePaymentAmount: number; // 垫付金额
  otherReceipt: number;    // 其他收款
  completionIncome: number; // 完工收入
  completionTime: string;  // 完成时间
  paymentTime: string;     // 收款时间
  serviceTime: string;     // 服务时间
  voiderNameAndReason: string; // 作废人/作废原因
  voidDetails: string;     // 作废详情
  cancelReasonAndDetails: string; // 取消原因/取消详情
  favoriteRemark: string;  // 收藏备注
}

// --- 辅助函数 ---
const formatCurrency = (amount: number) => {
  return Number.isInteger(amount) ? amount.toString() : amount.toFixed(1);
};

const formatDate = (date: Date) => {
  return `${date.getMonth() + 1}-${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// --- Mock 数据生成 ---
const generateMockData = (): Order[] => {
  const services = ['家庭保洁日常', '深度家电清洗', '甲醛治理', '玻璃清洗', '管道疏通', '空调清洗', '开荒保洁', '收纳整理', '沙发清洗'];
  const regions = ['北京市/朝阳区', '上海市/浦东新区', '深圳市/南山区', '杭州市/西湖区', '成都市/武侯区', '广州市/天河区', '武汉市/江汉区', '南京市/鼓楼区'];
  const sources = ['小程序', '电话', '美团', '转介绍', '抖音', '58同城'];
  const coefficients = [1.0, 1.1, 1.2, 1.3, 1.5];
  const methods = ['系统派单', '人工指派', '抢单模式', '指定师傅'];
  const warranties = ['30天', '3个月', '6个月', '无', '1年'];
  const names = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十'];
  const masters = ['王师傅', '李师傅', '张师傅', '刘师傅', '陈师傅'];
  const dispatchers = ['客服A', '客服B', '客服C', '系统自动'];
  
  let pendingCount = 0;

  return Array.from({ length: 128 }).map((_, i) => {
    const id = i + 1;
    let status = OrderStatus.Completed;
    let returnReason = undefined;
    let errorDetail = undefined;

    if (pendingCount < 10 && i % 10 === 0) { 
      status = OrderStatus.PendingDispatch;
      pendingCount++;
    } else if (i % 15 === 1) {
      status = OrderStatus.Void;
    } else if (i % 15 === 2) {
      status = OrderStatus.Returned;
      returnReason = '客户改期/联系不上';
    } else if (i % 15 === 3) {
      status = OrderStatus.Error;
      errorDetail = '现场与描述不符，需加价';
    } else {
      status = OrderStatus.Completed;
    }

    const baseAddress = `${['阳光', '幸福', '金地', '万科', '恒大'][i % 5]}花园 ${i % 20 + 1}栋 ${i % 30 + 1}0${i % 4 + 1}室`;
    const extraInfo = `(需联系物业核实车位情况)`;
    const baseDetails = ['需带梯子，层高3.5米，有大型犬', '有宠物，需要发票，客户要求穿鞋套', '尽量上午，客户下午要出门', '需带吸尘器，重点清理地毯', '刚装修完，灰尘较大'][i % 5];
    
    const amount = 150 + (i % 20) * 20;
    const cost = amount * (i % 2 === 0 ? 0.6 : 0.7);

    // Random dates
    const now = new Date();
    const dispatchDate = new Date(now.getTime() - Math.random() * 86400000 * 3);
    const completeDate = new Date(dispatchDate.getTime() + Math.random() * 7200000 + 3600000);
    const paymentDate = new Date(completeDate.getTime() + Math.random() * 60000);
    
    // Create historical price range
    const minPrice = Math.floor(amount * 0.8);
    const maxPrice = Math.floor(amount * 1.2);

    return {
      id,
      orderNo: `ORD-20231027-${String(id).padStart(4, '0')}`,
      workOrderNo: `WO-${9980 + id}`,
      dispatchTime: formatDate(dispatchDate),
      mobile: `13${i % 9 + 1}****${String(1000 + i).slice(-4)}`,
      serviceItem: services[i % services.length],
      serviceRatio: (['3:7', '4:6', '2:8'][i % 3]) as any,
      status,
      returnReason,
      errorDetail,
      region: regions[i % regions.length],
      address: baseAddress, 
      details: `${baseDetails} ${extraInfo}`,
      recordTime: formatDate(new Date(dispatchDate.getTime() - 3600000)),
      source: sources[i % sources.length],
      totalAmount: amount,
      cost: cost,
      hasAdvancePayment: i % 7 === 0,
      depositAmount: i % 12 === 0 ? 50 : undefined,
      weightedCoefficient: coefficients[i % coefficients.length],
      regionPeople: Math.floor(Math.random() * 6),
      isReminded: false,
      suggestedMethod: methods[i % methods.length],
      guidePrice: amount * 1.2,
      historicalPrice: `${minPrice}-${maxPrice}`,

      // 新增字段 Mock
      hasCoupon: Math.random() > 0.7,
      isCouponVerified: Math.random() > 0.8,
      isRead: Math.random() > 0.2,
      isCalled: Math.random() > 0.1,
      warrantyPeriod: warranties[i % warranties.length],
      workPhone: `15${i % 9 + 1}****${String(2000 + i).slice(-4)}`,
      customerName: names[i % names.length],
      dispatcherName: dispatchers[i % dispatchers.length],
      recorderName: dispatchers[(i + 1) % dispatchers.length],
      masterName: masters[i % masters.length],
      totalReceipt: amount,
      revenue: amount - cost,
      actualPaid: amount * 0.9,
      advancePaymentAmount: i % 7 === 0 ? 30 : 0,
      otherReceipt: i % 20 === 0 ? 20 : 0,
      completionIncome: amount - cost - 10,
      completionTime: status === OrderStatus.Completed ? formatDate(completeDate) : '',
      paymentTime: status === OrderStatus.Completed ? formatDate(paymentDate) : '',
      serviceTime: formatDate(new Date(dispatchDate.getTime() + 1800000)),
      voiderNameAndReason: status === OrderStatus.Void ? `操作员${i%3} / 客户取消` : '',
      voidDetails: status === OrderStatus.Void ? '客户表示暂时不需要服务了' : '',
      cancelReasonAndDetails: '',
      favoriteRemark: i % 10 === 0 ? '优质客户，下次优先' : '',
    };
  });
};

const FULL_MOCK_DATA = generateMockData();

// --- 组件定义 ---

const NotificationBar = () => {
  return (
    <div className="mb-3 bg-orange-50 border border-orange-100 rounded-lg px-4 py-2 flex items-center gap-3 overflow-hidden relative">
      <div className="flex items-center gap-1.5 text-orange-600 font-bold whitespace-nowrap z-10 bg-orange-50 pr-2">
        <Megaphone size={16} className="animate-pulse" />
        <span className="text-xs">通知公告</span>
      </div>
      <div className="flex-1 overflow-hidden relative h-5 group">
        <div className="absolute whitespace-nowrap animate-marquee group-hover:pause-animation text-xs text-orange-800 flex items-center">
          <span className="mr-8">📢 系统升级通知：今晚 24:00 将进行系统维护，预计耗时 30 分钟。</span>
          <span className="mr-8">🔥 10月业绩pk赛圆满结束，恭喜华东大区获得冠军！</span>
          <span className="mr-8">⚠️ 请各位接单员注意：近期客户反馈电话未接通率较高，请保持电话畅通。</span>
          <span>💡 新功能上线：现已支持批量导出财务报表，欢迎试用。</span>
        </div>
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .group-hover\\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

// 优化：ActionBar 包含高级筛选开关，放在黑名单后面
const ActionBar = ({ onRecord, isSearchOpen, onToggleSearch }: { onRecord: () => void, isSearchOpen: boolean, onToggleSearch: () => void }) => {
  return (
    <div className="flex items-center gap-6 mb-3 px-1">
      <div className="flex items-center gap-3">
        <button 
          onClick={onRecord}
          className="h-8 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded shadow-md shadow-blue-200 flex items-center gap-1.5 transition-all active:scale-95 font-medium"
        >
          <Plus size={14} /> 录单
        </button>
        <button className="h-8 px-5 bg-[#6366f1] hover:bg-[#4f46e5] text-white text-xs rounded shadow-md shadow-indigo-200 flex items-center gap-1.5 transition-all active:scale-95 font-medium">
          <Zap size={14} /> 快找
        </button>
      </div>
      
      <div className="h-5 w-px bg-slate-300"></div>
      
      <div className="flex items-center gap-6 text-xs text-slate-600 font-medium flex-1">
        <button className="hover:text-blue-600 transition-colors hover:bg-white hover:shadow-sm px-2 py-1 rounded">批量完成</button>
        <button className="hover:text-blue-600 transition-colors hover:bg-white hover:shadow-sm px-2 py-1 rounded">批量作废</button>
        <button className="hover:text-blue-600 transition-colors hover:bg-white hover:shadow-sm px-2 py-1 rounded">存疑号码</button>
        <button className="hover:text-blue-600 transition-colors hover:bg-white hover:shadow-sm px-2 py-1 rounded">黑名单</button>
        
        {/* 高级筛选按钮移动到这里 - 保持原有样式逻辑 */}
        <button 
          onClick={onToggleSearch}
          className={`flex items-center gap-1.5 transition-all active:scale-95 px-5 py-1.5 rounded shadow-md h-8 text-xs font-medium ml-auto animate-pulse 
            ${isSearchOpen 
              ? 'bg-blue-700 text-white shadow-blue-300' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'}`}
        >
            <Settings size={14} />
            <span>{isSearchOpen ? '收起高级筛选' : '点这高级筛选'}</span>
            {isSearchOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
    </div>
  );
};

// --- 重构：SearchPanel (纯筛选区，9列布局，无顶部条) ---
const SearchPanel = ({ isOpen }: { isOpen: boolean; onToggle?: () => void }) => {
  const [timeType, setTimeType] = useState('create');

  if (!isOpen) return null;

  return (
    <div className="shadow-sm mb-3 transition-all duration-300 ease-out relative rounded-lg border border-blue-200 bg-[#F0F7FF] px-5 py-4 animate-in fade-in slide-in-from-top-2">
       <div className="flex flex-col gap-3">
          
          {/* Grid Layout: 9 Columns */}
          <div className="grid grid-cols-9 gap-3">
              {/* --- ROW 1 (9 inputs) --- */}
              
              {/* 1. Order/Mobile/Customer */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">关键词</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="订单号/手机/客户..." />
              </div>
              {/* 2. Extension */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">分机</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 3. Creator */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">创建人</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 4. Service Item */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">项目</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="服务项目..." />
              </div>
              {/* 5. Region */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">地域</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 6. Status */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">状态</label>
                  <select className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="PendingDispatch">待派单</option><option value="Completed">已完成</option>
                  </select>
              </div>
              {/* 7. Source */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">来源</label>
                  <select className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="app">小程序</option><option value="phone">电话</option>
                  </select>
              </div>
               {/* 8. Dispatch Method */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">方式</label>
                  <select className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="auto">系统</option><option value="manual">人工</option>
                  </select>
              </div>
               {/* 9. Is Replenishment */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">补款</label>
                  <select className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white">
                    <option value="">全部</option><option value="yes">是</option><option value="no">否</option>
                  </select>
              </div>

              {/* --- ROW 2 (Remaining 5 inputs + Time(3) + Buttons(1)) = 9 cols --- */}

              {/* 10. Work Phone */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">工作机</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 11. Dispatcher */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">派单员</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 12. Master */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">师傅</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 13. Offline Master Phone */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">线师号</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>
              {/* 14. Cost Ratio */}
              <div className="flex items-center gap-2 col-span-1">
                  <label className="text-xs text-slate-500 whitespace-nowrap min-w-[30px] text-right">比例</label>
                  <input type="text" className="h-8 w-full px-2 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white placeholder-slate-300" placeholder="请输入..." />
              </div>

              {/* 15. Time Filter (Span 3 Cols) */}
              <div className="col-span-3 flex items-center gap-2">
                  <div className="relative shrink-0">
                    <select 
                      value={timeType}
                      onChange={(e) => setTimeType(e.target.value)}
                      className="h-8 pl-2 pr-6 border border-blue-200 rounded text-xs focus:border-blue-500 focus:outline-none bg-white font-medium text-slate-700 appearance-none cursor-pointer w-[80px]"
                    >
                      <option value="create">创建时间</option>
                      <option value="finish">完成时间</option>
                      <option value="payment">收款时间</option>
                      <option value="service">服务时间</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-2.5 text-slate-400 pointer-events-none"/>
                  </div>
                  <div className="flex items-center gap-2 bg-white border border-blue-200 rounded px-2 h-8 flex-1">
                     <Calendar size={14} className="text-slate-400" />
                     <input type="datetime-local" className="bg-transparent text-xs text-slate-600 outline-none flex-1 min-w-0" />
                     <span className="text-slate-300">-</span>
                     <input type="datetime-local" className="bg-transparent text-xs text-slate-600 outline-none flex-1 min-w-0" />
                  </div>
              </div>

              {/* 16. Buttons (Span 1 Col - Right Aligned) */}
              <div className="col-span-1 flex items-center gap-2 justify-end">
                  <button className="h-8 px-3 bg-white text-slate-600 hover:text-blue-600 text-xs rounded transition-colors border border-slate-200 hover:border-blue-400 shadow-sm font-medium w-full">
                      重置
                  </button>
                  <button className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-all font-bold shadow-md flex items-center justify-center gap-1 active:scale-95 w-full">
                      <Search size={12} /> 搜索
                  </button>
              </div>

          </div>
       </div>
    </div>
  );
};

// --- Modals & Cells ---

const RecordOrderModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isPasteMode, setIsPasteMode] = useState(false);
  const [pastedImages, setPastedImages] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]); 
  const pasteAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (isPasteMode && pasteAreaRef.current) {
          pasteAreaRef.current.focus();
      }
  }, [isPasteMode]);

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              setPastedImages(prev => [...prev, event.target!.result as string]);
            }
          };
          reader.readAsDataURL(blob);
        }
      }
    }
  };

  const confirmUpload = () => {
      setUploadedImages(prev => [...prev, ...pastedImages]);
      setPastedImages([]);
      setIsPasteMode(false);
  };

  if (!isOpen) return null;
  
  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white w-[1000px] h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800">新增订单</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={24}/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 flex gap-6">
             <div className="flex-1 space-y-5">
                <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700 text-right"><span className="text-red-500">*</span> 服务项目</label>
                    <div className="flex items-center gap-4">
                         <input type="text" placeholder="请输入关键词搜索" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                         <span className="text-xs text-gray-500 whitespace-nowrap">质保期： 展示质保期</span>
                    </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700 text-right"><span className="text-red-500">*</span> 地域</label>
                    <input type="text" placeholder="请输入关键词搜索" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 text-right mt-2"><span className="text-red-500">*</span> 地址</label>
                    <textarea placeholder="请输入内容" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20 resize-none"></textarea>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 text-right mt-2">详情</label>
                    <textarea placeholder="请输入详情" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 h-20 resize-none"></textarea>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 text-right mt-2">期望时间</label>
                    <div className="border border-blue-300 rounded-lg p-4 bg-blue-50/30 border-dashed w-full">
                        <div className="flex gap-6 mb-3">
                             <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" name="expectedTimeType" className="text-blue-600 focus:ring-blue-500" /> 尽快上门
                             </label>
                             <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input type="radio" name="expectedTimeType" className="text-blue-600 focus:ring-blue-500" /> 先联系
                             </label>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                             <span className="text-sm text-gray-600 w-16">希望日期:</span>
                             <input type="date" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" />
                        </div>
                        <div className="flex items-center gap-2">
                             <span className="text-sm text-gray-600 w-16">希望时间:</span>
                             <input type="time" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" />
                             <span className="text-gray-400">-</span>
                             <input type="time" className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm" />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700 text-right"><span className="text-red-500">*</span> 手机号码</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="请输入手机号码" className="flex-[2] border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                        <input type="text" placeholder="分机号" className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700 text-right">客户名称</label>
                    <input type="text" placeholder="请输入内容" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-[80px_1fr] gap-4 items-center">
                        <label className="text-sm font-medium text-gray-700 text-right"><span className="text-red-500">*</span> 订单来源</label>
                        <select className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white">
                           <option>请选择</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-[60px_1fr] gap-4 items-center">
                         <label className="text-sm font-medium text-gray-700 text-right"><span className="text-red-500">*</span> 工作机</label>
                         <input type="text" placeholder="请输入关键词搜索" className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                    </div>
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-4 items-start">
                    <label className="text-sm font-medium text-gray-700 text-right mt-2">图片附件</label>
                    <div className="w-full">
                         {!isPasteMode ? (
                             <div className="flex items-center gap-3">
                                 <button 
                                    onClick={() => setIsPasteMode(true)}
                                    className="flex items-center gap-2 px-4 py-2 border border-dashed border-blue-300 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
                                 >
                                    <ImageIcon size={16} />
                                    上传图片 (支持粘贴)
                                 </button>
                                 {uploadedImages.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto py-1">
                                       {uploadedImages.map((img, idx) => (
                                          <img key={idx} src={img} alt="uploaded" className="h-10 w-10 object-cover rounded border border-gray-200" />
                                       ))}
                                    </div>
                                 )}
                             </div>
                         ) : (
                             <div 
                                ref={pasteAreaRef}
                                tabIndex={0}
                                onPaste={handlePaste}
                                className="w-full border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                             >
                                <div className="text-center text-sm text-blue-600 mb-3 font-medium">
                                    请按 <kbd className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-gray-600 font-sans mx-1">Ctrl + V</kbd> 粘贴图片
                                </div>
                                {pastedImages.length > 0 && (
                                    <div className="grid grid-cols-5 gap-3 mb-4 max-h-40 overflow-y-auto p-1">
                                        {pastedImages.map((img, idx) => (
                                            <div key={idx} className="relative group">
                                                <img src={img} alt="pasted" className="w-full h-20 object-cover rounded border border-gray-200 shadow-sm" />
                                                <div className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 cursor-pointer hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setPastedImages(prev => prev.filter((_, i) => i !== idx))}>
                                                   <X size={12} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => {setIsPasteMode(false); setPastedImages([]);}} className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded">取消</button>
                                    <button onClick={confirmUpload} className="px-4 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 shadow-sm flex items-center gap-1">
                                        <Check size={12} /> 确认上传 {pastedImages.length > 0 && `(${pastedImages.length})`}
                                    </button>
                                </div>
                             </div>
                         )}
                    </div>
                </div>
             </div>
             <div className="w-[350px] flex flex-col gap-4 border-l border-gray-100 pl-6">
                 <div className="relative">
                    <textarea className="w-full h-32 border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-500 resize-none" placeholder="在此粘贴或输入内容，自动识别手机号码、服务项目、地址等信息"></textarea>
                 </div>
                 <div className="text-xs text-gray-500 space-y-2">
                    <p>例如：</p>
                    <p>【客】，iyang761227,13801109798，北京市海淀区，南四环.益桥附近，燃气灶维修，点不着火，上门费30，下单30，咨询</p>
                    <p>美团，18613313500，保定市竞秀区，建南街道，租赁影棚，未报价，27</p>
                    <p>线7，18729306628，陕西省西安市雁塔区，西安高新华府，打印机维修，小问题维修100，已加微信，定金30，住这儿</p>
                 </div>
                 <div className="flex items-center justify-between mt-2">
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded text-sm transition-colors shadow-sm">自动识别</button>
                    <div className="flex items-center gap-2">
                       <div className="w-8 h-4 bg-blue-500 rounded-full relative cursor-pointer">
                          <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                       </div>
                       <span className="text-xs text-blue-600">自动获取价格</span>
                    </div>
                 </div>
                 <div className="mt-4 flex-1 flex flex-col">
                    <h4 className="text-sm font-bold text-gray-700 mb-2">草稿暂存区</h4>
                    <div className="flex-1 bg-gray-50 rounded border border-gray-200 min-h-[100px]"></div>
                 </div>
             </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
              <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors shadow-sm">存入草稿箱</button>
              <button onClick={onClose} className="px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors">取消</button>
              <button onClick={onClose} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors shadow-sm">确定</button>
          </div>
       </div>
    </div>,
    document.body
  );
}

const ChatModal = ({ isOpen, onClose, role, order }: { isOpen: boolean; onClose: () => void; role: string; order: Order | null }) => {
  if (!isOpen || !order) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[600px] h-[500px] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-slate-50 border-b p-4 flex justify-between items-center">
          <div><h3 className="font-bold text-slate-800">联系{role}</h3><p className="text-xs text-slate-500 mt-1">订单: {order.orderNo}</p></div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
        </div>
        <div className="flex-1 bg-slate-100 p-4 overflow-y-auto space-y-4">
          {role === '群聊' ? (
             <div className="flex justify-center"><span className="text-xs text-slate-400 bg-slate-200 px-3 py-1 rounded-full">您已加入群聊</span></div>
          ) : (
            <div className="flex gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">{role[0]}</div><div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl shadow-sm text-sm text-slate-700 max-w-[80%]">您好，我是{role}。</div></div>
          )}
        </div>
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2"><input type="text" placeholder="输入消息..." className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm outline-none" /><button className="bg-blue-600 text-white px-4 py-2 rounded-lg"><Send size={18} /></button></div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ReminderCell = ({ order, onRemind }: { order: Order, onRemind: (id: number) => void }) => {
  const handleRemind = async () => {
    const text = `[催单] 订单号：${order.orderNo}\n手机号：${order.mobile}\n服务项目：${order.serviceItem}\n地域：${order.region}\n详细地址：${order.address}\n详情：${order.details}`;
    try {
        await navigator.clipboard.writeText(text);
        onRemind(order.id);
    } catch (err) {
        alert("复制失败");
    }
  };

  if (order.isReminded) {
     return <span className="text-[10px] text-gray-400 font-medium select-none whitespace-nowrap">已催单</span>;
  }

  return (
     <button 
        onClick={handleRemind}
        className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 hover:border-orange-300 text-[10px] rounded shadow-sm transition-colors flex items-center gap-1 whitespace-nowrap"
     >
       <Bell size={10} /> 催单
     </button>
  );
}

// --- 单元格组件 ---

const TooltipCell = ({ content, maxWidthClass = "max-w-[100px]", showTooltip }: { content: string, maxWidthClass?: string, showTooltip: boolean }) => {
  return (
    <div className={`relative ${maxWidthClass}`}>
      <div className="truncate text-[10px] leading-tight text-gray-600 cursor-default">
        {content}
      </div>
      {showTooltip && (
        <div className="absolute left-0 top-full mt-1 w-64 bg-gray-800 text-white text-xs p-3 rounded shadow-lg z-[80] whitespace-normal break-words animate-in fade-in duration-150">
          {content}
          <div className="absolute bottom-full left-4 border-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </div>
  );
}

const ServiceItemCell = ({ item }: { item: string }) => {
  return (
    <div className="py-1">
      <span className="font-medium text-gray-800 text-[11px]">
        {item}
      </span>
    </div>
  );
};

const StatusCell = ({ order }: { order: Order }) => {
  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PendingDispatch: return 'bg-orange-100 text-orange-700 border border-orange-200';
      case OrderStatus.Returned: return 'bg-red-100 text-red-700 border border-red-200';
      case OrderStatus.Error: return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
      case OrderStatus.Void: return 'bg-gray-100 text-gray-500 border border-gray-200';
      case OrderStatus.Completed: return 'bg-green-100 text-green-700 border border-green-200';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${getStatusStyle(order.status)}`}>
        {order.status}
      </span>
      {order.status === OrderStatus.Returned && order.returnReason && (
        <span className="text-[10px] text-red-500 mt-0.5 max-w-[140px] leading-tight text-center block">
          {order.returnReason}
        </span>
      )}
      {order.status === OrderStatus.Error && order.errorDetail && (
        <div className="mt-0.5 flex flex-col items-center">
          <span className="text-[10px] text-yellow-700 bg-yellow-50 px-1 py-0 rounded border border-yellow-200 max-w-[140px] truncate block" title={order.errorDetail}>
            {order.errorDetail}
          </span>
        </div>
      )}
    </div>
  );
};

const CompleteOrderModal = ({ isOpen, onClose, order }: { isOpen: boolean; onClose: () => void; order: Order | null }) => {
  if (!isOpen || !order) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white w-[500px] rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white"><h3 className="text-xl font-bold">完成订单</h3></div>
          <div className="p-6 space-y-4">
             <div className="flex justify-between text-sm"><span className="text-slate-500">应收金额</span><span className="font-bold text-lg text-emerald-600">¥{order.totalAmount}</span></div>
             <input type="number" defaultValue={order.totalAmount} className="w-full border border-slate-300 rounded-lg p-2" />
          </div>
          <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 text-slate-600">取消</button>
             <button onClick={onClose} className="px-6 py-2 bg-green-600 text-white rounded-lg">确认完成</button>
          </div>
       </div>
    </div>,
    document.body
  );
};

const CombinedIdCell = ({ orderNo, workOrderNo, hasAdvancePayment, depositAmount }: { orderNo: string; workOrderNo: string; hasAdvancePayment: boolean; depositAmount?: number }) => {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1">
          <span className="text-gray-900 font-medium text-[11px] font-mono tracking-tight select-all">{orderNo}</span>
          {hasAdvancePayment && (
            <span className="bg-rose-500 text-white text-[9px] px-1 rounded-[2px] whitespace-nowrap leading-none py-0.5">
              垫
            </span>
          )}
      </div>
      <div className="flex items-center gap-1">
          <span className="text-slate-400 font-mono text-[10px] select-all">{workOrderNo}</span>
          {depositAmount && depositAmount > 0 && (
            <span className="text-teal-600 bg-teal-50 border border-teal-100 text-[9px] px-1 rounded-[2px] whitespace-nowrap leading-none py-0.5">
              定{depositAmount}
            </span>
          )}
      </div>
    </div>
  );
};

const CombinedTimeCell = ({ recordTime, dispatchTime }: { recordTime: string, dispatchTime: string }) => {
  return (
      <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 whitespace-nowrap">
              <span className="text-slate-400 scale-90 origin-left">录</span> {recordTime}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium whitespace-nowrap">
               <span className="text-blue-400 scale-90 origin-left">上</span> {dispatchTime}
          </div>
      </div>
  )
}

const ActionCell = ({ orderId, onAction }: { orderId: number; onAction: (action: string, id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const menuElement = document.getElementById(`action-menu-${orderId}`);
        if (menuElement && !menuElement.contains(event.target as Node)) {
             setIsOpen(false);
        }
      }
    };
    const handleScroll = () => { if(isOpen) setIsOpen(false); }
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); 
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, orderId]);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 5,
        left: rect.right - 128
      });
    }
    setIsOpen(!isOpen);
  };

  const handleActionClick = (actionName: string) => {
    setIsOpen(false);
    onAction(actionName, orderId);
  };

  const menuItems = [
    { name: '复制订单', icon: Copy, color: 'text-gray-600' },
    { name: '开票', icon: FileText, color: 'text-blue-600' },
    { name: '完单', icon: CheckCircle, color: 'text-green-600' },
    { name: '详情', icon: Info, color: 'text-gray-600' },
    { name: '查资源', icon: Search, color: 'text-purple-600' },
    { name: '添加报错', icon: AlertTriangle, color: 'text-orange-600' },
    { name: '作废', icon: Trash2, color: 'text-red-600' },
    { name: '其他收款', icon: DollarSign, color: 'text-teal-600' },
  ];

  return (
    <>
      <button ref={buttonRef} onClick={toggleMenu} className={`px-2 py-1 rounded text-[10px] font-medium transition-all flex items-center justify-center gap-0.5 border ${isOpen ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-300'}`}>
        操作 <ChevronDown size={10} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && createPortal(
        <div id={`action-menu-${orderId}`} className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 w-32" style={{ top: menuPosition.top, left: menuPosition.left }}>
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button key={index} onClick={() => handleActionClick(item.name)} className="w-full text-left px-3 py-2 text-xs flex items-center hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group">
                <item.icon size={13} className={`mr-2 transition-transform group-hover:scale-110 ${item.color}`} />
                <span className="text-gray-700 font-medium">{item.name}</span>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

const App = () => {
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20; 

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>(FULL_MOCK_DATA);

  const handleRemindOrder = (id: number) => {
     setOrders(prevOrders => prevOrders.map(order => 
        order.id === id ? { ...order, isReminded: true } : order
     ));
  };
  
  const sortedData = [...orders].sort((a, b) => {
    const aIsPending = a.status === OrderStatus.PendingDispatch;
    const bIsPending = b.status === OrderStatus.PendingDispatch;
    if (aIsPending && !bIsPending) return -1;
    if (!aIsPending && bIsPending) return 1;
    if (a.isReminded !== b.isReminded) return a.isReminded ? 1 : -1;
    return 0;
  });

  const totalItems = sortedData.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const currentData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const [chatState, setChatState] = useState<{isOpen: boolean; role: string; order: Order | null;}>({ isOpen: false, role: '', order: null });
  const [hoveredTooltipCell, setHoveredTooltipCell] = useState<{rowId: number, colKey: 'address' | 'details' | 'service'} | null>(null);

  const handleAction = (action: string, id: number) => {
    const order = sortedData.find(o => o.id === id);
    if (!order) return;
    if (action === '完单') { setCurrentOrder(order); setCompleteModalOpen(true); } 
    else { alert(`已执行操作：${action} (订单ID: ${id})`); }
  };

  const handleOpenChat = (role: string, order: Order) => { setChatState({ isOpen: true, role, order }); };
  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };
  const handleMouseEnterOther = () => { setHoveredTooltipCell(null); };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-200 to-slate-300 p-6 flex flex-col overflow-hidden">
      <style>{`
        /* 
         * 核心优化：强制覆盖表格层级和背景，解决右侧固定列穿插问题
         * 使用 !important 确保样式优先级最高，不受 Tailwind 类名影响
         */

        /* 1. 全局单元格层级重置：让所有普通单元格层级最低 */
        td, th {
          z-index: 1;
          position: relative;
        }

        /* 2. 右侧固定列：最高层级，压住所有内容 */
        .sticky-col {
          position: sticky !important;
          z-index: 100 !important; /* 远高于普通单元格 */
          background-clip: padding-box;
        }
        
        /* 表头固定列：需要比表体固定列更高，防止表体内容滚上来盖住表头 */
        thead th.sticky-col {
          z-index: 110 !important;
        }
        
        /* 普通表头：也需要比普通内容高 */
        thead th:not(.sticky-col) {
          z-index: 50; 
        }

        /* --- 3. 背景色 (必须100%不透明) --- */
        
        /* 表头背景 */
        th.sticky-th-solid {
          background-color: #f8fafc !important; /* slate-50 */
        }

        /* 表体背景 - 默认（奇数行） */
        tr td.sticky-bg-solid {
          background-color: #ffffff !important;
        }
        
        /* 表体背景 - 偶数行 (Tailwind blue-50) */
        tr:nth-child(even) td.sticky-bg-solid {
          background-color: #eff6ff !important; 
        }
        
        /* 表体背景 - 鼠标悬停 (Tailwind blue-100) - 优先级最高 */
        tr:hover td.sticky-bg-solid {
          background-color: #dbeafe !important; 
        }

        /* --- 4. 定位与视觉分割 --- */
        
        /* 联系人列 (最左边的固定列) */
        .sticky-right-contact {
          right: 150px !important;
          border-left: 1px solid #cbd5e1 !important; /* 左侧实体分割线 */
          box-shadow: -6px 0 10px -4px rgba(0,0,0,0.15); /* 左侧投影，营造悬浮感 */
        }
        
        /* 催单列 */
        .sticky-right-remind {
          right: 70px !important;
        }
        
        /* 操作列 */
        .sticky-right-action {
          right: 0px !important;
        }
      `}</style>
      <div className="max-w-[1800px] mx-auto w-full flex-1 flex flex-col h-full">
        
        <NotificationBar />
        {/* Pass toggle function and state to ActionBar */}
        <ActionBar 
          onRecord={() => setIsRecordModalOpen(true)} 
          isSearchOpen={isSearchOpen}
          onToggleSearch={() => setIsSearchOpen(!isSearchOpen)}
        />
        {/* SearchPanel only displays content, toggle control is outside now but we pass it just in case or for closing */}
        <SearchPanel isOpen={isSearchOpen} onToggle={() => setIsSearchOpen(!isSearchOpen)} />
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="overflow-x-auto flex-1 overflow-y-auto relative">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 z-40 shadow-sm">
                <tr className="bg-slate-50 border-b-2 border-gray-300 text-base font-bold uppercase text-slate-700 tracking-wider">
                  <th className="px-2 py-2 whitespace-nowrap w-[110px] bg-slate-50 text-center sticky top-0 z-30">手机号</th>
                  <th className="px-2 py-2 w-[140px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">服务项目</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[90px] bg-slate-50 text-center sticky top-0 z-30">状态</th>
                  
                  {/* --- 已有列 --- */}
                  <th className="px-2 py-2 whitespace-nowrap w-[50px] bg-slate-50 text-center sticky top-0 z-30">系数</th>
                  <th className="px-2 py-2 whitespace-nowrap min-w-[120px] bg-slate-50 text-center sticky top-0 z-30">地域</th>
                  <th className="px-2 py-2 max-w-[120px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">详细地址</th> 
                  <th className="px-2 py-2 max-w-[140px] whitespace-nowrap bg-slate-50 sticky top-0 z-30">详情</th>
                  
                  <th className="px-2 py-2 whitespace-nowrap w-[70px] bg-slate-50 text-center sticky top-0 z-30">建议分成</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[80px] bg-slate-50 text-center sticky top-0 z-30">建议方式</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[80px] bg-slate-50 text-center sticky top-0 z-30">划线价</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[80px] bg-slate-50 text-center sticky top-0 z-30">历史价</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[70px] bg-slate-50 text-center sticky top-0 z-30">来源</th>
                  
                  <th className="px-2 py-2 whitespace-nowrap w-[160px] bg-slate-50 sticky top-0 z-30">订单/工单号</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[110px] bg-slate-50 sticky top-0 z-30">录单/上门</th>
                  <th className="px-2 py-2 whitespace-nowrap w-[60px] bg-slate-50 text-center sticky top-0 z-30">资源</th>

                  {/* --- 新增列 (24列) --- */}
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">是否有券</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">是否验券</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">是否已读</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">是否拨打</th>
                  
                  {/* 注意：以下列在初始视图中会被右侧固定列遮挡，滑动横条才会出现 */}
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">质保期</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">工作机</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">客户姓名</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">派单员</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">录单员</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">师傅</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">总收款</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">成本</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">业绩</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">实付金额</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">垫付金额</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">其他收款</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">完工收入</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">完成时间</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">收款时间</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">服务时间</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 text-center sticky top-0 z-30">作废人/原因</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">作废详情</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">取消原因/详情</th>
                  <th className="px-2 py-2 whitespace-nowrap bg-slate-50 sticky top-0 z-30 max-w-[150px]">收藏备注</th>

                  {/* --- 固定列 (联系人, 催单, 操作) --- */}
                  <th className="px-2 py-2 whitespace-nowrap text-center w-[140px] sticky-th-solid sticky-col sticky-right-contact">联系人</th>
                  <th className="px-2 py-2 whitespace-nowrap text-center w-[80px] sticky-th-solid sticky-col sticky-right-remind border-l border-gray-200">催单</th> 
                  <th className="px-2 py-2 text-center sticky-th-solid sticky-col sticky-right-action whitespace-nowrap w-[70px] border-l border-gray-200">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {currentData.map((order, index) => (
                  <tr key={order.id} onMouseLeave={handleMouseEnterOther} className="bg-white even:bg-blue-50 hover:!bg-blue-100 transition-colors group text-xs border-b border-gray-300 last:border-0 align-middle">
                    <td className="px-2 py-2 text-slate-800 font-bold text-[11px] tabular-nums whitespace-nowrap align-middle text-center" onMouseEnter={handleMouseEnterOther}>{order.mobile}</td>
                    
                    <td className="px-2 py-2 align-middle whitespace-nowrap" onMouseEnter={handleMouseEnterOther}>
                      <ServiceItemCell item={order.serviceItem} />
                    </td>
                    
                    <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'service'})}>
                      <StatusCell order={order} />
                    </td>

                    {/* 系数 */}
                    <td className="px-2 py-2 text-center align-middle" onMouseEnter={handleMouseEnterOther}>
                        <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{order.weightedCoefficient.toFixed(1)}</span>
                    </td>

                    <td className="px-2 py-2 text-slate-700 whitespace-nowrap align-middle text-center" onMouseEnter={handleMouseEnterOther}>
                        <div className="relative pr-8 inline-block"> 
                            {order.region}
                            <span className="absolute bottom-0 right-0 text-[9px] text-blue-600 border border-blue-200 bg-blue-50 px-1 rounded">
                              {order.regionPeople}人
                            </span>
                        </div>
                    </td>
                    <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'address'})}>
                      <TooltipCell content={order.address} maxWidthClass="max-w-[120px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'address'} />
                    </td>
                    <td className="px-2 py-2 align-middle" onMouseEnter={() => setHoveredTooltipCell({rowId: order.id, colKey: 'details'})}>
                      <TooltipCell content={order.details} maxWidthClass="max-w-[140px]" showTooltip={hoveredTooltipCell?.rowId === order.id && hoveredTooltipCell?.colKey === 'details'} />
                    </td>
                    
                    {/* 建议分成 */}
                    <td className="px-2 py-2 text-center align-middle font-medium text-slate-600" onMouseEnter={handleMouseEnterOther}>
                       {order.serviceRatio}
                    </td>
                    
                    {/* 建议方式 */}
                    <td className="px-2 py-2 text-center align-middle" onMouseEnter={handleMouseEnterOther}>
                       <span className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] text-gray-600 whitespace-nowrap">{order.suggestedMethod}</span>
                    </td>

                     {/* 划线价 */}
                    <td className="px-2 py-2 text-center align-middle font-medium text-slate-600" onMouseEnter={handleMouseEnterOther}>
                       {formatCurrency(order.guidePrice)}
                    </td>

                     {/* 历史价 */}
                    <td className="px-2 py-2 text-center align-middle font-medium text-slate-600" onMouseEnter={handleMouseEnterOther}>
                       {order.historicalPrice}
                    </td>

                    {/* 来源 */}
                    <td className="px-2 py-2 align-middle text-center" onMouseEnter={handleMouseEnterOther}><span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] border border-slate-200 whitespace-nowrap font-medium">{order.source}</span></td>
                    
                    {/* 订单/工单号 */}
                    <td className="px-2 py-2 align-middle" onMouseEnter={handleMouseEnterOther}>
                        <CombinedIdCell orderNo={order.orderNo} workOrderNo={order.workOrderNo} hasAdvancePayment={order.hasAdvancePayment} depositAmount={order.depositAmount} />
                    </td>

                    {/* 录单/上门时间 */}
                    <td className="px-2 py-2 align-middle" onMouseEnter={handleMouseEnterOther}>
                        <CombinedTimeCell recordTime={order.recordTime} dispatchTime={order.dispatchTime} />
                    </td>

                    {/* 资源 */}
                    <td className="px-2 py-2 align-middle text-center" onMouseEnter={handleMouseEnterOther}>
                        <button className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"><Search size={14} /></button>
                    </td>

                    {/* --- 新增列内容 (24列) --- */}
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap">{order.hasCoupon ? <Check size={14} className="text-green-500 mx-auto"/> : <span className="text-gray-300">-</span>}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap">{order.isCouponVerified ? <span className="text-green-600 font-bold">是</span> : <span className="text-gray-400">否</span>}</td>
                    
                    {/* 是否已读 */}
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap">
                        {order.isRead ? <span className="text-gray-400 text-[11px]">已读</span> : <span className="text-orange-500 text-[11px]">未读</span>}
                    </td>
                    
                    {/* 是否拨打 */}
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap">
                        {order.isCalled ? <span className="text-gray-400 text-[11px]">已拨打</span> : <span className="text-orange-500 text-[11px]">未拨打</span>}
                    </td>
                    
                    {/* 以下列内容在初始状态会被右侧固定列遮挡 */}
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600">{order.warrantyPeriod}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600">{order.workPhone}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-700 font-medium">{order.customerName}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600">{order.dispatcherName}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-600">{order.recorderName}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-700 font-medium">{order.masterName}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-emerald-600 font-bold">{formatCurrency(order.totalReceipt)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-500">{formatCurrency(order.cost)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-orange-600 font-bold">{formatCurrency(order.revenue)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700">{formatCurrency(order.actualPaid)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700">{formatCurrency(order.advancePaymentAmount)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700">{formatCurrency(order.otherReceipt)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap font-mono text-slate-700">{formatCurrency(order.completionIncome)}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[10px] text-slate-500">{order.completionTime || '-'}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[10px] text-slate-500">{order.paymentTime || '-'}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-[10px] text-slate-500">{order.serviceTime || '-'}</td>
                    <td className="px-2 py-2 align-middle text-center whitespace-nowrap text-slate-500">{order.voiderNameAndReason || '-'}</td>
                    <td className="px-2 py-2 align-middle whitespace-nowrap"><TooltipCell content={order.voidDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                    <td className="px-2 py-2 align-middle whitespace-nowrap"><TooltipCell content={order.cancelReasonAndDetails || '-'} maxWidthClass="max-w-[150px]" showTooltip={false} /></td>
                    <td className="px-2 py-2 align-middle whitespace-nowrap text-slate-500">{order.favoriteRemark || '-'}</td>


                    {/* --- 固定列 (联系人, 催单, 操作) --- */}
                    <td className="px-2 py-2 align-middle text-center sticky-col sticky-right-contact sticky-bg-solid" onMouseEnter={handleMouseEnterOther}>
                      <div className="grid grid-cols-2 gap-1 justify-items-center max-w-[100px] mx-auto">
                        <button onClick={() => handleOpenChat('派单员', order)} className="text-[11px] w-full py-0.5 rounded border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium">派单员</button>
                        <button onClick={() => handleOpenChat('运营', order)} className="text-[11px] w-full py-0.5 rounded border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium">运营</button>
                        <button onClick={() => handleOpenChat('售后', order)} className="text-[11px] w-full py-0.5 rounded border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium">售后</button>
                        <button onClick={() => handleOpenChat('群聊', order)} className="text-[11px] w-full py-0.5 rounded border border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors whitespace-nowrap font-medium">群聊</button>
                      </div>
                    </td>
                    <td className="px-2 py-2 align-middle text-center sticky-col sticky-right-remind sticky-bg-solid border-l border-gray-200" onMouseEnter={handleMouseEnterOther}><ReminderCell order={order} onRemind={handleRemindOrder} /></td>
                    <td className="px-2 py-2 text-center sticky-col sticky-right-action sticky-bg-solid whitespace-nowrap border-l border-gray-200"><ActionCell orderId={order.id} onAction={handleAction} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-white px-6 py-3 border-t border-gray-200 flex justify-between items-center mt-auto">
             <span className="text-xs text-slate-500 font-medium">显示 {((currentPage - 1) * pageSize) + 1} 到 {Math.min(currentPage * pageSize, totalItems)} 条，共 {totalItems} 条订单</span>
             <div className="flex gap-1.5">
               <button onClick={handlePrevPage} disabled={currentPage === 1} className="px-3 py-1 border border-slate-200 rounded-md bg-white text-slate-600 text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm">上一页</button>
               <button className="px-3 py-1 border border-blue-600 rounded-md bg-blue-600 text-white text-xs font-bold shadow-md">{currentPage}</button>
               <button onClick={handleNextPage} disabled={currentPage === totalPages} className="px-3 py-1 border border-slate-200 rounded-md bg-white text-slate-600 text-xs hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm">下一页</button>
             </div>
          </div>
        </div>
      </div>
      <RecordOrderModal isOpen={isRecordModalOpen} onClose={() => setIsRecordModalOpen(false)} />
      <CompleteOrderModal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} order={currentOrder} />
      <ChatModal isOpen={chatState.isOpen} onClose={() => setChatState(prev => ({ ...prev, isOpen: false }))} role={chatState.role} order={chatState.order} />
    </div>
  );
};

const container = document.getElementById('root');
if (container) {
  const appRoot = createRoot(container);
  appRoot.render(<App />);
}