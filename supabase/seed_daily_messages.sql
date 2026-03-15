-- Seed 20+ daily love messages for "Today's message from me" on the World page.
-- Run this in Supabase → SQL Editor.
-- If the table already has rows, this adds more. Adjust or skip if you want to replace.

INSERT INTO public.daily_messages (message, order_index, visible) VALUES
  ('You are my favorite part of every day.', 1, true),
  ('I fall in love with you a little more every morning.', 2, true),
  ('No matter what today brings, knowing you’re in my life is enough.', 3, true),
  ('You make ordinary moments feel like magic.', 4, true),
  ('Thinking of you is my favorite hobby.', 5, true),
  ('Today, like every day, I’m grateful for you.', 6, true),
  ('You’re the reason I believe in love stories.', 7, true),
  ('I don’t need a special day to remind me how much I love you.', 8, true),
  ('Your smile is my favorite view.', 9, true),
  ('Every moment with you feels like a gift.', 10, true),
  ('I love you more than I did yesterday and less than I will tomorrow.', 11, true),
  ('You’re the best thing that ever happened to my days.', 12, true),
  ('My heart finds its home in you.', 13, true),
  ('You make my world brighter just by being in it.', 14, true),
  ('I’m so lucky to get to love you.', 15, true),
  ('Today I’m sending you a little extra love.', 16, true),
  ('You’re my safe place and my greatest adventure.', 17, true),
  ('I love you for who you are and who you’re becoming.', 18, true),
  ('Every day with you is a day I don’t take for granted.', 19, true),
  ('You’re the answer to so many of my prayers.', 20, true),
  ('I choose you today and every day.', 21, true),
  ('You’re my person. Always have been, always will be.', 22, true);
