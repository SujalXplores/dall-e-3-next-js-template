'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  Download, ImageIcon, Loader2, Lock, LogOut,
  Trash2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { imagePlaceholder } from '@/lib/utils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MAX_CHAR_COUNT = 1000;

const Home = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageUrls, setImageUrls] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('generatedImages');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState('create');
  const [textareaValue, setTextareaValue] = useState('');

  const saveImagesToLocalStorage = (images) => {
    localStorage.setItem('generatedImages', JSON.stringify(images));
  };

  const textareaRef = useRef(null);

  const handleDeleteImage = (imageUrl) => {
    const newImageUrls = imageUrls.filter((url) => url !== imageUrl);
    setImageUrls(newImageUrls);
    saveImagesToLocalStorage(newImageUrls);
  };

  const handleDeleteAllImages = () => {
    setImageUrls([]);
    saveImagesToLocalStorage([]);
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const prompt = formData.get('prompt');
    const quality = formData.get('quality');
    const style = formData.get('style');
    const size = formData.get('size');

    try {
      const response = await fetch('/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt, quality, style, size,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        setError(errorMessage);
      }
      else {
        const data = await response.json();
        const newImageUrls = [data.image, ...imageUrls];
        setImageUrls(newImageUrls);
        saveImagesToLocalStorage(newImageUrls);
        setActiveTab('gallery');
      }
    }
    catch (_error) {
      setError('Unknown error!');
    }
    finally {
      setIsLoading(false);
    }
  };

  const handlePromptChange = (event) => {
    const text = event.target.value.slice(0, MAX_CHAR_COUNT);
    setTextareaValue(text);
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const { data: session } = useSession();

  if (!session) {
    return (
      <motion.main
        animate="visible"
        className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center"
        initial="hidden"
        variants={fadeIn}
      >
        <motion.div
          className="text-center space-y-6 max-w-md"
          variants={fadeIn}
        >
          <h1 className="text-4xl font-bold">
            AI
            {' '}
            <span className="animated-gradient-text">Artistry Studio</span>
          </h1>
          <p className="text-xl text-muted-foreground">Unleash your creativity with AI-powered image generation</p>
          <Button className="mt-4 rounded-full" size="lg" onClick={() => signIn('google')}>
            <Lock className="mr-2 h-5 w-5" />
            Sign In with Google
          </Button>
        </motion.div>
      </motion.main>
    );
  }

  return (
    <motion.main
      animate="visible"
      className="container mx-auto px-4 py-8 min-h-screen"
      initial="hidden"
      variants={fadeIn}
    >
      <motion.header
        className="flex justify-between items-center py-6 mb-8"
        variants={fadeIn}
      >
        <h1 className="text-3xl font-bold">
          AI
          {' '}
          <span className="animated-gradient-text">Artistry Studio</span>
        </h1>
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="relative h-8 w-8 rounded-full" variant="ghost">
                <Avatar className="h-8 w-8">
                  <AvatarImage alt={session.user.name} src={session.user.image} />
                  <AvatarFallback>{session.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{session.user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </motion.header>

      <Tabs className="space-y-8" defaultValue="create" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Masterpiece</TabsTrigger>
          <TabsTrigger value="gallery">Your Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <motion.div variants={fadeIn}>
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-2xl font-semibold mb-6">Craft Your Masterpiece</h2>
                {error ? (
                  <Alert className="mb-6" variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : null}
                <form className="space-y-6" noValidate onSubmit={onSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Describe your vision:</Label>
                    <Textarea
                      maxLength={MAX_CHAR_COUNT}
                      name="prompt"
                      placeholder="Paint a picture with words - the more detailed, the better!"
                      ref={textareaRef}
                      rows={6}
                      required
                      onChange={handlePromptChange}
                    />
                    <p className="text-sm text-muted-foreground flex justify-between">
                      <span>Let your imagination run wild. The more specific you are, the more amazing the result!</span>
                      <span>
                        {textareaValue.length}
                        {' '}
                        /
                        {' '}
                        {MAX_CHAR_COUNT}
                      </span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quality">Quality:</Label>
                      <Select defaultValue="hd" name="quality" required>
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
                      <Select defaultValue="vivid" name="style" required>
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
                      <Select defaultValue="1024x1024" name="size" required>
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
                  <Button className="w-full" disabled={isLoading} type="submit">
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
                          <AlertDialogAction onClick={handleDeleteAllImages}>
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                <ScrollArea className="h-[600px] pr-4">
                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    variants={staggerChildren}
                  >
                    {imageUrls.map((imageUrl) => (
                      <motion.div key={imageUrl} variants={fadeIn}>
                        <Card className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="relative aspect-square">
                              <Image
                                alt="Generated Image"
                                className="object-cover"
                                placeholder={imagePlaceholder({ width: 512, height: 512 })}
                                src={imageUrl}
                                fill
                              />
                            </div>
                          </CardContent>
                          <CardFooter className="flex flex-col sm:flex-row justify-between p-4 space-y-2 sm:space-y-0">
                            <Button className="w-full sm:w-auto" variant="outline" asChild>
                              <a
                                download={`generated-image-${imageUrl.split('/').pop()}`}
                                href={imageUrl}
                                rel="noopener noreferrer"
                                target="_blank"
                              >
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </a>
                            </Button>
                            <Button
                              className="w-full sm:w-auto text-red-500"
                              variant="ghost"
                              onClick={() => handleDeleteImage(imageUrl)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}

                    {imageUrls.length === 0 && (
                      <motion.div
                        className="col-span-full flex flex-col items-center justify-center h-[400px] text-center"
                        variants={fadeIn}
                      >
                        <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-xl font-semibold text-muted-foreground">
                          Your Gallery Awaits
                        </p>
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
};

export default Home;
