import { SquareKanban } from 'lucide-react';
import CreateBoardForm from '../_components/create-board-form';

const CreateBoardPage = () => {
  return (
    <div className="h-[calc(100vh-50px)] w-full px-8">
      <div className="w-full">
        <div className="flex flex-col space-y-2 text-primary p-8 rounded-t-lg">
          <SquareKanban className="w-16 h-16" />
          <h1 className="text-4xl font-bold pt-2">Create Your Board</h1>
          <p className="text-muted-foreground text-sm">
            Design your perfect workspace. Choose a name and color to get
            started on your next big project.
          </p>
        </div>

        <div className="px-8 py-2">
          <CreateBoardForm />
        </div>
      </div>
    </div>
  );
};

export default CreateBoardPage;
