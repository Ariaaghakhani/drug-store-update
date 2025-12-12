<template>
  <div
    class="hidden md:flex w-1/2 bg-gradient-to-br relative from-teal-600 to-cyan-500 text-white items-center justify-center p-12"
  >
    <div
      class="absolute inset-0"
      style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)"
    />
    <div class="relative z-10 p-12 flex flex-col items-center justify-center text-white">
      <div class="text-center space-y-6">
        <h1 class="text-4xl font-bold leading-tight">
          سلامتی شما،<br >اولویت ماست
        </h1>
        <p class="text-lg text-white/90">
          خرید آسان و امن دارو با بهترین قیمت و مشاوره رایگان
        </p>

        <div class="flex items-center justify-center gap-4 mt-8">
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl rotate-12 animate-float" />
          <div class="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-3xl -rotate-6 animate-float-delayed" />
          <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl rotate-12 animate-float" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(12deg); }
  50% { transform: translateY(-10px) rotate(12deg); }
}

@keyframes float-delayed {
  0%, 100% { transform: translateY(0) rotate(-6deg); }
  50% { transform: translateY(-15px) rotate(-6deg); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

.animate-float-delayed {
  animation: float-delayed 3s ease-in-out infinite;
  animation-delay: 0.5s;
}
</style>
