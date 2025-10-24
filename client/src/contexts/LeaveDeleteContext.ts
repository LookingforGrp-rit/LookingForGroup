import { createContext } from 'react';

type LeaveDeleteContextProps = {
  isOwner: boolean;
  projId: number,
  userId: number,
  reloadProjects: () => void,
};

export const LeaveDeleteContext = createContext<LeaveDeleteContextProps>({
  isOwner: false,
  projId: 0,
  userId: 0,
  reloadProjects: () => {},
});
