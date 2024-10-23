declare module './components/Header' {
  const Header: React.FC;
  export default Header;
}

declare module './components/MadeBy' {
  const MadeBy: React.FC;
  export default MadeBy;
}

declare module './components/ContentLeft' {
  interface ContentLeftProps {
    submitPhoto: (file: File) => void;
    error: boolean;
  }
  const ContentLeft: React.FC<ContentLeftProps>;
  export default ContentLeft;
}

declare module './components/ContentRight' {
  interface ContentRightProps {
    selectLineup: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }
  const ContentRight: React.FC<ContentRightProps>;
  export default ContentRight;
}

declare module './components/Notification' {
  interface NotificationProps {
    show: boolean;
    message: string;
    type: string;
  }
  const Notification: React.FC<NotificationProps>;
  export default Notification;
}
