import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MapPin, Home, Building, Mail } from "lucide-react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

// Define the form schema with zod
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters"
  }),
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  phone: z.string().min(10, {
    message: "Please enter a valid phone number"
  }),
  address: z.string().min(5, {
    message: "Please enter your full address"
  }),
  city: z.string().min(2, {
    message: "City is required"
  }),
  state: z.string().min(2, {
    message: "State is required"
  }),
  zipCode: z.string().min(4, {
    message: "Please enter a valid ZIP code"
  }),
  message: z.string().optional()
});
type FormValues = z.infer<typeof formSchema>;
const AddressFormSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressData, setAddressData] = useState({
    fullAddress: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      message: ""
    }
  });

  // Handle address autocomplete selection
  const handleAddressSelect = (addressInfo: {
    fullAddress: string;
    city: string;
    state: string;
    zipCode: string;
  }) => {
    setAddressData(addressInfo);

    // Update form values
    form.setValue("address", addressInfo.fullAddress);
    form.setValue("city", addressInfo.city);
    form.setValue("state", addressInfo.state);
    form.setValue("zipCode", addressInfo.zipCode);
  };
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log("Form submitted:", data);
      toast.success("Your information has been submitted successfully!");

      // Reset form
      form.reset();
      setAddressData({
        fullAddress: "",
        city: "",
        state: "",
        zipCode: ""
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("There was an error submitting your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section className="py-24 bg-black/20 backdrop-blur-sm">
      
    </section>;
};
export default AddressFormSection;