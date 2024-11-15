import CreateBoardForm from '../../_components/create-board-form';
import ModalWrapper from './modal-wrapper';

export default async function Page() {
  return (
    <ModalWrapper>
      <CreateBoardForm />
    </ModalWrapper>
  );
}
