'use client';

import { createBoard } from '@/actions/board';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import DisplayServerActionResponse from '@/components/display-server-action-response';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAction } from 'next-safe-action/hooks';
import * as z from 'zod';
import { createBoardSchema } from '@/schemas';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'react-toastify';
import useBoardColor from '@/hooks/useBoardColor';
import { Label } from '@radix-ui/react-label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type Board = z.infer<typeof createBoardSchema>;

const CreateBoardForm = () => {
  const router = useRouter();
  const { COLORS, randomColor, colorClasses } = useBoardColor();

  const {
    execute,
    result,
    status,
    reset: actionResponseReset,
  } = useAction(createBoard, {
    onSuccess: ({ data }) => {
      form.reset();
      actionResponseReset();
      toast(data?.message, { type: 'success' });
      router.back();
    },
  });

  const form = useForm<Board>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: {
      name: '',
      color: 'red',
    },
  });

  const onSubmit = (data: Board) => {
    execute(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <DisplayServerActionResponse result={result} />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Choose color *</FormLabel>
              <FormControl>
                <RadioGroup
                  name={field.name}
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-[repeat(auto-fit,minmax(30px,50px))] gap-2"
                >
                  {COLORS.map((color) => (
                    <FormItem key={color}>
                      <FormControl>
                        <FormLabel
                          htmlFor={color}
                          className="block relative h-[30px] w-full"
                        >
                          <RadioGroupItem
                            id={color}
                            value={color}
                            className="peer sr-only"
                            checked={color === field.value}
                          />
                          <span
                            className={`cursor-pointer flex flex-1 h-full w-full ${colorClasses[color]} peer-data-[state=checked]:ring ring-offset-2  rounded`}
                          ></span>
                        </FormLabel>
                      </FormControl>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Board name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter board name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          {/* <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
              actionResponseReset();
            }}
            disabled={status === 'executing'}
          >
            Reset
          </Button> */}
          <Button
            type="submit"
            className="w-full"
            disabled={status === 'executing'}
          >
            Create
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateBoardForm;
