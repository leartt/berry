'use client';

import modalRegistry from '@/lib/card-actions-modal-registry';
import { ModalType } from '@/lib/types';
import { useState } from 'react';

export const useCardActionsModal = () => {
  // state needed for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType | undefined>();

  const closeModal = () => {
    setIsModalOpen(false);
    setModalType(undefined);
  };

  const configureModal = (type: ModalType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const renderModal = <T extends (typeof modalRegistry)[ModalType]>(
    component: T,
    props?: Omit<React.ComponentProps<T>, 'isOpen' | 'closeModal'>
  ) => {
    const ModalComponent = component as React.ComponentType<any>;

    return (
      <ModalComponent isOpen={isModalOpen} closeModal={closeModal} {...props} />
    );
  };

  return {
    isModalOpen,
    closeModal,
    configureModal,
    modalType,
    renderModal,
  };
};
