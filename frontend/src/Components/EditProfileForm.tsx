"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

// The User interface from your original component
interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatarUrl?: string; 
  phone_number: string | null;
  address: string | null;
}

// 1. Define the schema for the form
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50, {
    message: "Name must be at most 50 characters.",
  }),
  // Email is disabled and not editable in this form, but included for context if needed
  // email: z.string().email({ message: "Invalid email address." }), 
  phone_number: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  avatarUrl: z.string().url({ message: "Invalid URL for avatar." }).nullable().optional().or(z.literal('')),
});

// Infer the type from the schema for type safety
type ProfileFormValues = z.infer<typeof formSchema>;

const API_BASE_URL = 'http://localhost:8000/api/users';

interface EditProfileFormProps {
  user: User;
  onSuccess: (updatedUser: User) => void;
  onClose: () => void;
}

export function EditProfileForm({ user, onSuccess, onClose }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name,
      
      phone_number: user.phone_number ?? '',
      address: user.address ?? '',
      avatarUrl: user.avatarUrl ?? '',
    },
  });

  
  async function onSubmit(values: ProfileFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    
    const dataToSubmit = {
        name: values.name,
        phone_number: values.phone_number || null,
        address: values.address || null,
        avatarUrl: values.avatarUrl || null,
    };

    try {
      
      const response = await fetch(`${API_BASE_URL}/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update profile (Status: ${response.status})`);
      }

      const updatedData = await response.json();
      
      
      const updatedUser: User = { 
        ...user, 
        ...updatedData, 
        
        email: user.email 
      }; 

      onSuccess(updatedUser);
      onClose(); 

    } catch (err) {
      console.error('Error updating user data:', err);
      setSubmitError(`Update failed: ${err instanceof Error ? err.message : 'Network error.'}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Email Field (Non-editable, for display only) */}
        <FormItem>
            <FormLabel>Email Address</FormLabel>
            <Input value={user.email} disabled className="text-muted-foreground" />
            <p className="text-[0.8rem] text-muted-foreground">Email address cannot be changed here.</p>
        </FormItem>

        {/* Phone Number Field */}
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                {/* Use the value property directly from the field, which handles null/undefined */}
                <Input placeholder="(123) 456-7890" type="tel" {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Address Field */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Nairobi, Kenya" 
                  className="resize-none" 
                  {...field} 
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Avatar URL Field */}
        <FormField
          control={form.control}
          name="avatarUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/avatar.jpg" 
                  type="url" 
                  {...field} 
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submission Error Message */}
        {submitError && (
          <p className="text-sm font-medium text-destructive flex items-center">
            <AlertCircle className="mr-2 h-4 w-4" /> {submitError}
          </p>
        )}

        <DialogFooter className="pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full sm:w-auto"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

