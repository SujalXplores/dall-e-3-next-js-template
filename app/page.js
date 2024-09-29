"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ImageIcon, Download, Trash2, Loader2, Clipboard } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { imagePlaceholder } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { motion } from "framer-motion";

const MAX_CHAR_COUNT = 1000;
export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('generatedImages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState("create");
  const [textareaValue, setTextareaValue] = useState('');

  // Function to save images to local storage
  const saveImagesToLocalStorage = (images) => {
    localStorage.setItem('generatedImages', JSON.stringify(images));
  };

  const textareaRef = useRef(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const currentValue = textareaRef.current.value;
        const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
        setTextareaValue(newValue);
        textareaRef.current.setSelectionRange(start + text.length, start + text.length);
        textareaRef.current.focus();
      }
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  };

  function handleDeleteImage(index) {
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImageUrls);
    saveImagesToLocalStorage(newImageUrls);
  }

  function handleDeleteAllImages() {
    setImageUrls([]);
    saveImagesToLocalStorage([]);
  }

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const prompt = formData.get("prompt");
    const quality = formData.get("quality");
    const style = formData.get("style");
    const size = formData.get("size");

    try {
      const response = await fetch("/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, quality, style, size }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error || `HTTP error! status: ${response.status}`;
        setError(errorMessage);
      } else {
        const data = await response.json();
        const newImageUrls = [data.image, ...imageUrls];
        setImageUrls(newImageUrls);
        saveImagesToLocalStorage(newImageUrls);
        setActiveTab("gallery");
      }
    } catch (error) {
      console.error(error);
      setError("Unknown error!");
    } finally {
      setIsLoading(false);
    }
  }

  const handlePromptChange = (event) => {
    const text = event.target.value.slice(0, MAX_CHAR_COUNT);
    setTextareaValue(text);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="container mx-auto px-4 py-8 min-h-screen"
    >
      <motion.header
        variants={fadeIn}
        className="flex flex-col sm:flex-row justify-between items-center py-6 mb-8"
      >
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">AI <span className="animated-gradient-text">Artistry Studio</span></h1>
        <Separator className="w-full sm:hidden my-4" />
      </motion.header>

      <Tabs defaultValue="create" className="space-y-8" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Masterpiece</TabsTrigger>
          <TabsTrigger value="gallery">Your Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <motion.div variants={fadeIn}>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-6">Craft Your Masterpiece</h2>
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form noValidate onSubmit={onSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Describe your vision:</Label>
                    <div className="relative">
                      <Textarea
                        ref={textareaRef}
                        name="prompt"
                        rows={6}
                        placeholder="Paint a picture with words - the more detailed, the better!"
                        required
                        onChange={handlePromptChange}
                        maxLength={MAX_CHAR_COUNT}
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="absolute right-2 top-2"
                              onClick={handlePaste}
                            >
                              <Clipboard className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Paste from clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="text-sm text-muted-foreground flex justify-between">
                      <span>Let your imagination run wild. The more specific you are, the more amazing the result!</span>
                      <span>{textareaValue.length} / {MAX_CHAR_COUNT}</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quality">Quality:</Label>
                      <Select name="quality" defaultValue="hd" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hd">HD</SelectItem>
                          <SelectItem value="standard">Standard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="style">Style:</Label>
                      <Select name="style" defaultValue="vivid" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vivid">Vivid</SelectItem>
                          <SelectItem value="natural">Natural</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="size">Size:</Label>
                      <Select name="size" defaultValue="1024x1024" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1024x1024">1024x1024</SelectItem>
                          <SelectItem value="1792x1024">1792x1024</SelectItem>
                          <SelectItem value="1024x1792">1024x1792</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button disabled={isLoading} type="submit" className="w-full">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Generate Image
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="gallery">
          <motion.div variants={fadeIn}>
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Your Masterpiece Collection</h2>
                  {imageUrls.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete All
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete all your generated images.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteAllImages}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <ScrollArea className="h-[600px] pr-4">
                  <motion.div
                    variants={staggerChildren}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  >
                    {imageUrls.map((imageUrl, index) => (
                      <motion.div key={index} variants={fadeIn}>
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative aspect-square">
                              <Image
                                fill
                                src={imageUrl}
                                alt="Generated Image"
                                className="object-cover"
                                placeholder={imagePlaceholder({ width: 512, height: 512 })}
                              />
                            </div>
                          </CardContent>
                          <CardFooter className="flex flex-col sm:flex-row justify-between p-4 space-y-2 sm:space-y-0">
                            <Button asChild variant="outline" className="w-full sm:w-auto">
                              <a
                                href={imageUrl}
                                download={`generated-image-${index}.jpg`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                            <Button variant="ghost" onClick={() => handleDeleteImage(index)} className="w-full sm:w-auto text-red-500">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}

                    {imageUrls.length === 0 && (
                      <motion.div
                        variants={fadeIn}
                        className="col-span-full flex flex-col items-center justify-center h-[400px] text-center"
                      >
                        <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-xl font-semibold text-muted-foreground">Your Gallery Awaits</p>
                        <p className="mt-2 text-sm text-muted-foreground max-w-md">
                          Create your first masterpiece and watch your collection grow
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.main>
  );
}