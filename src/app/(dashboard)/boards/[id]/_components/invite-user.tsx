'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { X, Check, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import { Member as PrismaMember } from '@prisma/client';

import { useAuth } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import { searchMembers } from '@/actions/member';
import { useAction } from 'next-safe-action/hooks';
import { createInvitation } from '@/actions/invitation';
import { useParams } from 'next/navigation';
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts';

type InviteMembersModalProps = {
  isOpen: boolean;
  onClose: () => void;
  boardOwnerId: string;
};

type Member = PrismaMember & {
  invitations: { board: { id: string; ownerId: string } }[];
};

export default function InviteMembersModal({
  isOpen,
  onClose,
  boardOwnerId,
}: InviteMembersModalProps) {
  const params = useParams<{ id: string }>();
  const { userId } = useAuth();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Member[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const [debouncedQuery, setDebouncedQuery] = useDebounceValue(query, 495);

  const { execute: sendInvitation } = useAction(createInvitation, {
    onSuccess: ({ data }) => {
      toast.success(data?.message);

      setSelectedMembers([]);
      setIsLoading(false);
      onClose();
    },
    onError: ({ error }) => {
      toast.error('Error while sending the invitation');
      setSelectedMembers([]);
      setIsLoading(false);
    },
  });

  useEffect(() => {
    const getSuggestions = async () => {
      if (query.length > 0) {
        const results = await searchMembers(query);
        console.log(results);

        setSuggestions(
          results.filter(
            (result) =>
              !selectedMembers.some((member) => member.id === result.id)
          )
        );

        setIsFetchingSuggestions(false);
      }
    };
    getSuggestions();
  }, [debouncedQuery, selectedMembers]);

  useEffect(() => {
    if (query.length === 0) {
      setSuggestions([]);
    } else if (query.length > 0) {
      setIsFetchingSuggestions(true);
    }
  }, [query]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleSelect = (member: Member) => {
    setSelectedMembers([...selectedMembers, member]);
    setQuery('');
    inputRef.current?.focus();
  };

  const handleRemove = (id: string) => {
    setSelectedMembers(selectedMembers.filter((member) => member.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // call the server action
    sendInvitation({
      boardId: params!.id as string,
      membersId: selectedMembers.map((member) => member.id),
    });
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md transform transition-all duration-300 ease-in-out"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Invite Members to Board
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label
              htmlFor="member-search"
              className="text-sm font-medium text-gray-700"
            >
              Search Members
            </Label>
            <div className="relative">
              <Input
                type="text"
                id="member-search"
                placeholder="Type a name or email"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-1 block w-full"
                ref={inputRef}
              />

              <ul className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg max-h-60 overflow-auto">
                {isFetchingSuggestions && (
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin" />
                  </li>
                )}
                {suggestions.length > 0 &&
                  suggestions.map((suggestion) => (
                    <li
                      key={suggestion.id}
                      className={cn(
                        'px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center',
                        (suggestion.userId === userId ||
                          suggestion.userId === boardOwnerId ||
                          suggestion.invitations.some(
                            (i) => i.board.id === params!.id
                          )) &&
                          'pointer-events-none opacity-50 cursor-not-allowed'
                      )}
                      onClick={() => handleSelect(suggestion)}
                    >
                      <span>
                        {suggestion.username} ({suggestion.email})
                      </span>
                      <Check className="w-5 h-5 text-green-500" />
                    </li>
                  ))}
              </ul>
            </div>
          </div>
          {selectedMembers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-blue-100 text-blue-800 text-sm font-semibold px-2 py-1 rounded-full flex items-center"
                >
                  {member.username ?? member.email}
                  <button
                    type="button"
                    onClick={() => handleRemove(member.id)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">
                      Remove {member.username ?? member.email}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || selectedMembers.length === 0}
          >
            {isLoading
              ? 'Sending Invitations...'
              : `Send Invitation${selectedMembers.length !== 1 ? 's' : ''}`}
          </Button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Selected members will receive an email with instructions to join the
          board.
        </p>
      </div>
    </div>,
    document.body
  );
}
