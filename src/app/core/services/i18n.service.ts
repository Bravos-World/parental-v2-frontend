import { Injectable, signal } from '@angular/core';

export type Language = 'vi' | 'en';

export interface Translations {
  [key: string]: string;
}

const VI: Translations = {
  // ── Layout / Nav ──
  'nav.dashboard': 'Bảng điều khiển',
  'nav.settings': 'Cài đặt',
  'nav.logout': 'Đăng xuất',
  'nav.admin': 'Quản trị',

  // ── Login ──
  'login.subtitle': 'Bảng Quản Trị',
  'login.username': 'Tên đăng nhập',
  'login.password': 'Mật khẩu',
  'login.username_placeholder': 'Nhập tên đăng nhập',
  'login.password_placeholder': 'Nhập mật khẩu',
  'login.sign_in': 'Đăng nhập',
  'login.signing_in': 'Đang đăng nhập...',
  'login.error_required': 'Vui lòng nhập tên đăng nhập và mật khẩu',
  'login.error_failed': 'Đăng nhập thất bại. Vui lòng thử lại.',

  // ── Register ──
  'register.title': 'Tạo tài khoản quản trị',
  'register.username': 'TÊN ĐĂNG NHẬP',
  'register.password': 'MẬT KHẨU',
  'register.confirm_password': 'XÁC NHẬN MẬT KHẨU',
  'register.username_placeholder': 'Chọn tên đăng nhập',
  'register.password_placeholder': 'Chọn mật khẩu',
  'register.confirm_placeholder': 'Xác nhận mật khẩu',
  'register.submit': 'Tạo tài khoản',
  'register.creating': 'Đang tạo...',
  'register.login_link': 'Đã có tài khoản?',
  'register.login_action': 'Đăng nhập',
  'register.success': 'Tạo tài khoản thành công! Đang chuyển hướng...',
  'register.error_required': 'Vui lòng điền đầy đủ thông tin',
  'register.error_username_short': 'Tên đăng nhập phải có ít nhất 3 ký tự',
  'register.error_password_short': 'Mật khẩu phải có ít nhất 4 ký tự',
  'register.error_password_mismatch': 'Mật khẩu không khớp',
  'register.error_failed': 'Tạo tài khoản thất bại',

  // ── Dashboard ──
  'dashboard.title': 'Bảng Điều Khiển',
  'dashboard.desc': 'Giám sát và quản lý các thiết bị kết nối',
  'dashboard.total_devices': 'Tổng Thiết Bị',
  'dashboard.online': 'Trực Tuyến',
  'dashboard.offline': 'Ngoại Tuyến',
  'dashboard.locked': 'Đã Khóa',
  'dashboard.broadcast_title': 'Phát Lệnh Đến Tất Cả Thiết Bị Trực Tuyến',
  'dashboard.delay': 'Độ trễ',
  'dashboard.lock_all': 'Khóa Tất Cả',
  'dashboard.unlock_all': 'Mở Khóa Tất Cả',
  'dashboard.shutdown_all': 'Tắt Tất Cả',
  'dashboard.restart_all': 'Khởi Động Lại Tất Cả',
  'dashboard.devices_title': 'Thiết Bị',
  'dashboard.loading': 'Đang tải thiết bị...',
  'dashboard.empty_title': 'Không tìm thấy thiết bị',
  'dashboard.empty_desc': 'Thiết bị sẽ hiển thị tại đây khi kết nối đến máy chủ.',
  'dashboard.view_details': 'Xem chi tiết →',
  'dashboard.ip': 'ĐỊA CHỈ IP',
  'dashboard.lock_status': 'TRẠNG THÁI KHÓA',
  'dashboard.last_seen': 'LẦN CUỐI NHÌN THẤY',
  'dashboard.lock_now': 'Khóa Ngay',
  'dashboard.unlock_temp': 'Mở Tạm',
  'dashboard.delete_device': 'Xóa Thiết Bị',
  'dashboard.unlock_for': 'Mở khóa trong',
  'dashboard.lock_now_success': 'Đã gửi lệnh khóa thiết bị',
  'dashboard.unlock_now_success': 'Đã mở khóa thiết bị trong {time}',
  'dashboard.delete_success': 'Đã xóa thiết bị thành công',
  'dashboard.delete_confirm': 'Bạn có chắc chắn muốn xóa thiết bị này?',
  'dashboard.action_failed': 'Thao tác thất bại',

  // ── Device Detail ──
  'device.back': '← Quay lại Bảng Điều Khiển',
  'device.loading': 'Đang tải thiết bị...',
  'device.ip_address': 'Địa chỉ IP',
  'device.created': 'Ngày tạo',
  'device.last_seen': 'Lần cuối nhìn thấy',
  'device.commands_title': 'Điều Khiển Từ Xa',
  'device.delay': 'Độ trễ',
  'device.lock': 'Khóa',
  'device.unlock': 'Mở Khóa',
  'device.shutdown': 'Tắt Máy',
  'device.restart': 'Khởi Động Lại',
  'device.offline_hint': '⚠️ Thiết bị ngoại tuyến. Không thể gửi lệnh.',
  'device.message_title': 'Gửi Thông Báo',
  'device.message_placeholder': 'Nhập nội dung thông báo...',
  'device.send_message': 'Gửi Thông Báo',
  'device.events_title': 'Lịch Sử Sự Kiện',
  'device.refresh': 'Làm Mới',
  'device.no_events': 'Chưa có sự kiện nào được ghi nhận.',
  'device.type': 'Loại',
  'device.description': 'Mô tả',
  'device.time': 'Thời gian',
  'device.prev': '← Trước',
  'device.next': 'Tiếp →',
  'device.page_info': 'Trang {current} / {total}',
  'device.command_sent': 'Đã gửi lệnh {type}',
  'device.command_failed': 'Gửi lệnh thất bại',
  'device.message_sent': 'Đã gửi thông báo',
  'device.message_failed': 'Gửi thông báo thất bại',
  'device.load_failed': 'Tải thiết bị thất bại',

  // ── Settings ──
  'settings.title': 'Cài Đặt',
  'settings.desc': 'Quản lý tài khoản và người dùng quản trị',
  'settings.tab_password': 'Đổi Mật Khẩu',
  'settings.tab_create': 'Tạo Tài Khoản',
  'settings.change_password_title': 'Đổi Mật Khẩu',
  'settings.change_password_desc': 'Cập nhật mật khẩu quản trị hiện tại',
  'settings.current_password': 'MẬT KHẨU HIỆN TẠI',
  'settings.new_password': 'MẬT KHẨU MỚI',
  'settings.confirm_password': 'XÁC NHẬN MẬT KHẨU MỚI',
  'settings.current_password_placeholder': 'Nhập mật khẩu hiện tại',
  'settings.new_password_placeholder': 'Nhập mật khẩu mới',
  'settings.confirm_password_placeholder': 'Xác nhận mật khẩu mới',
  'settings.update_password': 'Cập Nhật Mật Khẩu',
  'settings.updating': 'Đang cập nhật...',
  'settings.create_title': 'Tạo Tài Khoản Quản Trị',
  'settings.create_desc': 'Thêm quản trị viên mới vào hệ thống',
  'settings.admin_only': 'Chỉ Quản Trị',
  'settings.choose_username': 'Chọn tên đăng nhập',
  'settings.choose_password': 'Chọn mật khẩu',
  'settings.confirm_acc_password': 'Xác nhận mật khẩu',
  'settings.create_account': 'Tạo Tài Khoản',
  'settings.creating': 'Đang tạo...',
  'settings.error_required': 'Vui lòng điền đầy đủ thông tin',
  'settings.error_password_mismatch': 'Mật khẩu mới không khớp',
  'settings.error_password_short': 'Mật khẩu mới phải có ít nhất 4 ký tự',
  'settings.error_username_short': 'Tên đăng nhập phải có ít nhất 3 ký tự',
  'settings.password_changed': 'Đổi mật khẩu thành công',
  'settings.password_failed': 'Đổi mật khẩu thất bại',
  'settings.account_created': 'Tạo tài khoản "{username}" thành công',
  'settings.create_failed': 'Tạo tài khoản thất bại',

  // ── Delay Presets ──
  'delay.immediately': 'Ngay lập tức',
  'delay.5min': '5 phút',
  'delay.15min': '15 phút',
  'delay.30min': '30 phút',
  'delay.1hour': '1 giờ',
  'delay.2hours': '2 giờ',
  'delay.custom': 'Tùy chỉnh',
  'delay.minutes': 'Phút',
  'delay.hours': 'Giờ',
  'delay.enter_value': 'Nhập giá trị',
  'delay.execute_immediately': 'Thực thi ngay lập tức',
  'delay.seconds': '{n} giây',
  'delay.minute': '{n} phút',
  'delay.hour_min': '{h} giờ {m} phút',
  'delay.hour': '{h} giờ',

  // ── Broadcast ──
  'broadcast.command_sent': 'Đã gửi lệnh {type} đến tất cả thiết bị',
  'broadcast.command_failed': 'Gửi lệnh thất bại',

  // ── Languages ──
  'lang.vi': '🇻🇳 Tiếng Việt',
  'lang.en': '🇬🇧 English',
};

const EN: Translations = {
  // ── Layout / Nav ──
  'nav.dashboard': 'Dashboard',
  'nav.settings': 'Settings',
  'nav.logout': 'Logout',
  'nav.admin': 'Admin',

  // ── Login ──
  'login.subtitle': 'Admin Control Panel',
  'login.username': 'Username',
  'login.password': 'Password',
  'login.username_placeholder': 'Enter your username',
  'login.password_placeholder': 'Enter your password',
  'login.sign_in': 'Sign In',
  'login.signing_in': 'Signing in...',
  'login.error_required': 'Please enter your username and password',
  'login.error_failed': 'Login failed. Please try again.',

  // ── Register ──
  'register.title': 'Create Admin Account',
  'register.username': 'USERNAME',
  'register.password': 'PASSWORD',
  'register.confirm_password': 'CONFIRM PASSWORD',
  'register.username_placeholder': 'Choose a username',
  'register.password_placeholder': 'Choose a password',
  'register.confirm_placeholder': 'Confirm your password',
  'register.submit': 'Create Account',
  'register.creating': 'Creating...',
  'register.login_link': 'Already have an account?',
  'register.login_action': 'Sign In',
  'register.success': 'Account created! Redirecting to login...',
  'register.error_required': 'All fields are required',
  'register.error_username_short': 'Username must be at least 3 characters',
  'register.error_password_short': 'Password must be at least 4 characters',
  'register.error_password_mismatch': 'Passwords do not match',
  'register.error_failed': 'Failed to create account',

  // ── Dashboard ──
  'dashboard.title': 'Dashboard',
  'dashboard.desc': 'Monitor and manage connected devices',
  'dashboard.total_devices': 'Total Devices',
  'dashboard.online': 'Online',
  'dashboard.offline': 'Offline',
  'dashboard.locked': 'Locked',
  'dashboard.broadcast_title': 'Broadcast to All Online Devices',
  'dashboard.delay': 'Delay',
  'dashboard.lock_all': 'Lock All',
  'dashboard.unlock_all': 'Unlock All',
  'dashboard.shutdown_all': 'Shutdown All',
  'dashboard.restart_all': 'Restart All',
  'dashboard.devices_title': 'Devices',
  'dashboard.loading': 'Loading devices...',
  'dashboard.empty_title': 'No devices found',
  'dashboard.empty_desc': 'Devices will appear here once they connect to the server.',
  'dashboard.view_details': 'View details →',
  'dashboard.ip': 'IP',
  'dashboard.lock_status': 'Lock',
  'dashboard.last_seen': 'Last Seen',
  'dashboard.lock_now': 'Lock Now',
  'dashboard.unlock_temp': 'Unlock Temp',
  'dashboard.delete_device': 'Delete Device',
  'dashboard.unlock_for': 'Unlock for',
  'dashboard.lock_now_success': 'Lock command sent to device',
  'dashboard.unlock_now_success': 'Device unlocked for {time}',
  'dashboard.delete_success': 'Device deleted successfully',
  'dashboard.delete_confirm': 'Are you sure you want to delete this device?',
  'dashboard.action_failed': 'Action failed',

  // ── Device Detail ──
  'device.back': '← Back to Dashboard',
  'device.loading': 'Loading device...',
  'device.ip_address': 'IP Address',
  'device.created': 'Created',
  'device.last_seen': 'Last Seen',
  'device.commands_title': 'Remote Commands',
  'device.delay': 'Delay',
  'device.lock': 'Lock',
  'device.unlock': 'Unlock',
  'device.shutdown': 'Shutdown',
  'device.restart': 'Restart',
  'device.offline_hint': '⚠️ Device is offline. Commands cannot be sent.',
  'device.message_title': 'Send Notification',
  'device.message_placeholder': 'Type your message here...',
  'device.send_message': 'Send Message',
  'device.events_title': 'Event History',
  'device.refresh': 'Refresh',
  'device.no_events': 'No events recorded yet.',
  'device.type': 'Type',
  'device.description': 'Description',
  'device.time': 'Time',
  'device.prev': '← Prev',
  'device.next': 'Next →',
  'device.page_info': 'Page {current} of {total}',
  'device.command_sent': '{type} command sent',
  'device.command_failed': 'Failed to send command',
  'device.message_sent': 'Message sent',
  'device.message_failed': 'Failed to send message',
  'device.load_failed': 'Failed to load device',

  // ── Settings ──
  'settings.title': 'Settings',
  'settings.desc': 'Manage your account and admin users',
  'settings.tab_password': 'Change Password',
  'settings.tab_create': 'Create Account',
  'settings.change_password_title': 'Change Password',
  'settings.change_password_desc': 'Update your current admin password',
  'settings.current_password': 'CURRENT PASSWORD',
  'settings.new_password': 'NEW PASSWORD',
  'settings.confirm_password': 'CONFIRM NEW PASSWORD',
  'settings.current_password_placeholder': 'Enter current password',
  'settings.new_password_placeholder': 'Enter new password',
  'settings.confirm_password_placeholder': 'Confirm new password',
  'settings.update_password': 'Update Password',
  'settings.updating': 'Updating...',
  'settings.create_title': 'Create Admin Account',
  'settings.create_desc': 'Add a new administrator to the system',
  'settings.admin_only': 'Admin Only',
  'settings.choose_username': 'Choose a username',
  'settings.choose_password': 'Choose a password',
  'settings.confirm_acc_password': 'Confirm password',
  'settings.create_account': 'Create Account',
  'settings.creating': 'Creating...',
  'settings.error_required': 'All fields are required',
  'settings.error_password_mismatch': 'New passwords do not match',
  'settings.error_password_short': 'New password must be at least 4 characters',
  'settings.error_username_short': 'Username must be at least 3 characters',
  'settings.password_changed': 'Password changed successfully',
  'settings.password_failed': 'Failed to change password',
  'settings.account_created': 'Admin account "{username}" created',
  'settings.create_failed': 'Failed to create account',

  // ── Delay Presets ──
  'delay.immediately': 'Immediately',
  'delay.5min': '5 min',
  'delay.15min': '15 min',
  'delay.30min': '30 min',
  'delay.1hour': '1 hour',
  'delay.2hours': '2 hours',
  'delay.custom': 'Custom',
  'delay.minutes': 'Minutes',
  'delay.hours': 'Hours',
  'delay.enter_value': 'Enter value',
  'delay.execute_immediately': 'Execute immediately',
  'delay.seconds': '{n} seconds',
  'delay.minute': '{n} minute(s)',
  'delay.hour_min': '{h} hour(s) {m} min',
  'delay.hour': '{h} hour(s)',

  // ── Broadcast ──
  'broadcast.command_sent': '{type} command sent to all devices',
  'broadcast.command_failed': 'Failed to send command',

  // ── Languages ──
  'lang.vi': '🇻🇳 Tiếng Việt',
  'lang.en': '🇬🇧 English',
};

const TRANSLATIONS: Record<Language, Translations> = { vi: VI, en: EN };

@Injectable({ providedIn: 'root' })
export class I18nService {
  private static readonly STORAGE_KEY = 'pcv2_lang';

  currentLang = signal<Language>(this.loadLang());

  private loadLang(): Language {
    const stored = localStorage.getItem(I18nService.STORAGE_KEY);
    if (stored === 'vi' || stored === 'en') return stored;
    return 'vi'; // default Vietnamese
  }

  setLang(lang: Language) {
    this.currentLang.set(lang);
    localStorage.setItem(I18nService.STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  }

  t(key: string, params?: Record<string, string | number>): string {
    const dict = TRANSLATIONS[this.currentLang()];
    let text = dict[key] ?? key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      });
    }
    return text;
  }

  get isVi(): boolean {
    return this.currentLang() === 'vi';
  }

  toggle() {
    this.setLang(this.currentLang() === 'vi' ? 'en' : 'vi');
  }
}
