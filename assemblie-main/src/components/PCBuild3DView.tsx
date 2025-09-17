import React, { useRef, useEffect, useState } from 'react';
import { Computer, Cpu, HardDrive, Fan, Zap, MemoryStick, Microchip, Layers, Package2 } from 'lucide-react';

interface PCBuild3DViewProps {
  components: {
    processor: string;
    graphics: string;
    memory: string;
    storage: string;
    cooling: string;
    power: string;
    motherboard: string;
    pcCase: string;
  };
  showBrands?: boolean;
}

const PCBuild3DView: React.FC<PCBuild3DViewProps> = ({ components, showBrands = true }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rgbColor, setRgbColor] = useState('rgb(0, 191, 255)');
  const [rotation, setRotation] = useState(0);
  const [buildComplete, setBuildComplete] = useState(false);
  const [caseAnimationClass, setCaseAnimationClass] = useState('');

  const componentStatus = {
    processor: !!components.processor,
    graphics: !!components.graphics,
    memory: !!components.memory,
    storage: !!components.storage,
    cooling: !!components.cooling,
    power: !!components.power,
    motherboard: !!components.motherboard,
    pcCase: !!components.pcCase,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const r = Math.floor(Math.sin(Date.now() / 2000) * 127 + 128);
      const g = Math.floor(Math.sin(Date.now() / 2000 + 2) * 127 + 128);
      const b = Math.floor(Math.sin(Date.now() / 2000 + 4) * 127 + 128);
      setRgbColor(`rgb(${r}, ${g}, ${b})`);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.2) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (components.pcCase && !caseAnimationClass) {
      setCaseAnimationClass('animate-pulse');
      setTimeout(() => {
        setCaseAnimationClass('animate-scale-in');
      }, 1000);
    }
  }, [components.pcCase]);

  useEffect(() => {
    if (Object.values(componentStatus).every(Boolean) && !buildComplete) {
      setBuildComplete(true);
    }
  }, [components]);

  const getBrandName = (componentType: string, value: string) => {
    if (!showBrands || !value) return '';
    
    const componentMap: Record<string, Record<string, string>> = {
      processor: {
        'amd_ryzen5': '<span class="brand-amd">AMD</span> Ryzen 5',
        'amd_ryzen7': '<span class="brand-amd">AMD</span> Ryzen 7',
        'amd_ryzen9': '<span class="brand-amd">AMD</span> Ryzen 9',
        'intel_i5': '<span class="brand-intel">Intel</span> Core i5',
        'intel_i7': '<span class="brand-intel">Intel</span> Core i7',
        'intel_i9': '<span class="brand-intel">Intel</span> Core i9',
      },
      graphics: {
        'nvidia_rtx3060': '<span class="brand-nvidia">NVIDIA</span> RTX 3060',
        'nvidia_rtx3070': '<span class="brand-nvidia">NVIDIA</span> RTX 3070',
        'nvidia_rtx3080': '<span class="brand-nvidia">NVIDIA</span> RTX 3080',
        'nvidia_rtx3090': '<span class="brand-nvidia">NVIDIA</span> RTX 3090',
        'amd_rx6700': '<span class="brand-amd">AMD</span> RX 6700 XT',
        'amd_rx6800': '<span class="brand-amd">AMD</span> RX 6800 XT',
        'amd_rx6900': '<span class="brand-amd">AMD</span> RX 6900 XT',
      },
      memory: {
        '8gb': 'Corsair 8GB DDR4',
        '16gb': 'G.Skill 16GB DDR4',
        '32gb': 'Kingston 32GB DDR4',
        '64gb': 'Corsair 64GB DDR4',
        '16gb_ddr5': 'G.Skill 16GB DDR5',
        '32gb_ddr5': 'Kingston 32GB DDR5',
      },
      storage: {
        'ssd_500': 'Kingston 500GB SSD',
        'ssd_1tb': 'Samsung 1TB SSD',
        'ssd_2tb': 'Crucial 2TB SSD',
        'ssd_nvme_500': 'WD 500GB NVMe',
        'ssd_nvme_1tb': 'Samsung 1TB NVMe',
        'ssd_nvme_2tb': 'Corsair 2TB NVMe',
      },
      cooling: {
        'air_standard': 'Cooler Master Air',
        'air_premium': 'Noctua Premium Air',
        'aio_240': 'Corsair 240mm AIO',
        'aio_360': 'NZXT 360mm AIO',
        'custom_loop': 'EK Custom Loop',
      },
      power: {
        '500w': 'EVGA 500W Bronze',
        '650w': 'Corsair 650W Gold',
        '750w': 'Seasonic 750W Gold',
        '850w': 'be quiet! 850W Gold',
        '1000w': 'Corsair 1000W Platinum',
      },
      motherboard: {
        'b450': 'MSI B450',
        'b550': 'ASUS B550-F',
        'x570': 'GIGABYTE X570',
        'z590': 'MSI Z590',
        'z690': 'ASUS Z690',
        'z790': 'GIGABYTE Z790',
      },
      pcCase: {
        'mid_basic': 'NZXT H510',
        'mid_premium': 'Corsair 4000D Airflow',
        'full_standard': 'Phanteks P500A',
        'full_premium': 'Lian Li O11 Dynamic',
        'micro_itx': 'Cooler Master NR200P',
      }
    };
    
    return componentMap[componentType]?.[value] || '';
  };

  const getBrandNameHTML = (componentType: string, value: string) => {
    if (!showBrands || !value) return '';
    
    const brandName = getBrandName(componentType, value);
    return <span dangerouslySetInnerHTML={{ __html: brandName }} />;
  };

  const completionPercentage = Object.values(componentStatus).filter(Boolean).length / 
                              Object.values(componentStatus).length * 100;

  return (
    <div ref={containerRef} className="relative h-[400px] w-full bg-card/30 rounded-lg border border-border/50 overflow-hidden rgb-panel">
      <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
      
      <div className="absolute inset-0 flex items-center justify-center perspective">
        <div 
          className={`relative w-64 h-80 border-2 rounded-md overflow-hidden shadow-lg transition-all duration-500 transform-gpu ${caseAnimationClass}`}
          style={{ 
            borderColor: rgbColor,
            transform: `rotateY(${rotation / 10}deg) rotateX(${Math.sin(rotation / 20) * 5}deg)`,
            boxShadow: `0 0 20px ${rgbColor}40`,
          }}
        >
          <div className="absolute inset-0 bg-card opacity-70"></div>
          
          <div 
            className="absolute inset-0 opacity-20 mix-blend-overlay" 
            style={{ background: `linear-gradient(45deg, ${rgbColor}, transparent, ${rgbColor})` }}
          ></div>
          
          <div className="relative h-full w-full p-4 flex flex-col items-center justify-between">
            <div className="absolute top-2 left-2 right-2 h-1 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-1000 ease-in-out" 
                style={{ width: `${completionPercentage}%`, backgroundColor: rgbColor }}
              ></div>
            </div>
            
            <div className={`absolute inset-0 border border-border/50 rounded-md ${components.pcCase ? 'animate-fade-in' : 'opacity-10'}`}
              style={{ borderColor: components.pcCase ? rgbColor : undefined }}
            >
              {showBrands && components.pcCase && (
                <span className="absolute bottom-1 right-2 text-[8px]" style={{ color: rgbColor }}>{getBrandNameHTML('pcCase', components.pcCase)}</span>
              )}
            </div>
            
            <div className={`w-full h-12 mt-auto mb-2 ${components.power ? 'animate-fade-in' : 'opacity-20'}`}>
              <div className="h-full w-full bg-card/60 border border-border/50 rounded-md flex flex-col items-center justify-center">
                <Zap className={`h-6 w-6 ${components.power ? 'animate-pulse-light' : 'text-muted-foreground'}`} 
                  style={{ color: components.power ? rgbColor : undefined }}
                />
                {showBrands && components.power && (
                  <span className="text-xs mt-1" style={{ color: rgbColor }}>{getBrandNameHTML('power', components.power)}</span>
                )}
              </div>
            </div>
            
            <div className="w-5/6 h-52 bg-secondary/40 rounded-md flex flex-col items-center justify-start p-3 space-y-3 transform-gpu"
              style={{ transform: `translateZ(5px)` }}
            >
              {components.motherboard && (
                <div className="absolute top-1 left-1 flex items-center gap-1">
                  <Layers className="h-3 w-3" style={{ color: rgbColor }} />
                  {showBrands && (
                    <span className="text-[8px]" style={{ color: rgbColor }}>{getBrandNameHTML('motherboard', components.motherboard)}</span>
                  )}
                </div>
              )}
              
              <div className={`w-16 h-16 ${components.processor ? 'animate-fade-in' : 'opacity-20'}`}>
                <div className="h-full w-full bg-card/60 border border-border/50 rounded-md flex flex-col items-center justify-center">
                  <Cpu className={`h-8 w-8 ${components.processor ? '' : 'text-muted-foreground'}`} 
                    style={{ color: components.processor ? rgbColor : undefined }}
                  />
                  {showBrands && components.processor && (
                    <span className="text-xs mt-1 text-center" style={{ color: rgbColor }}>{getBrandNameHTML('processor', components.processor)}</span>
                  )}
                </div>
              </div>
              
              <div className={`flex space-x-2 ${components.memory ? 'animate-fade-in' : 'opacity-20'}`}>
                <div className="h-12 w-6 bg-card/60 border border-border/50 rounded-sm flex flex-col items-center">
                  <MemoryStick className={`h-4 w-4 mt-1 ${components.memory ? '' : 'text-muted-foreground'}`} 
                    style={{ color: components.memory ? rgbColor : undefined }}
                  />
                </div>
                <div className="h-12 w-6 bg-card/60 border border-border/50 rounded-sm flex flex-col items-center">
                  <MemoryStick className={`h-4 w-4 mt-1 ${components.memory ? '' : 'text-muted-foreground'}`}
                    style={{ color: components.memory ? rgbColor : undefined }}
                  />
                </div>
                {showBrands && components.memory && (
                  <span className="text-xs text-center absolute mt-14" style={{ color: rgbColor }}>{getBrandNameHTML('memory', components.memory)}</span>
                )}
              </div>
              
              <div className={`w-5/6 h-12 ${components.graphics ? 'animate-fade-in' : 'opacity-20'}`}>
                <div className="h-full w-full bg-card/60 border border-border/50 rounded-md flex flex-col items-center justify-center">
                  <Microchip className={`h-6 w-6 ${components.graphics ? '' : 'text-muted-foreground'}`}
                    style={{ color: components.graphics ? rgbColor : undefined }}
                  />
                  {showBrands && components.graphics && (
                    <span className="text-xs mt-1" style={{ color: rgbColor }}>{getBrandNameHTML('graphics', components.graphics)}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className={`absolute right-6 top-20 w-12 h-12 ${components.storage ? 'animate-fade-in' : 'opacity-20'}`}>
              <div className="h-full w-full bg-card/60 border border-border/50 rounded-md flex flex-col items-center justify-center">
                <HardDrive className={`h-6 w-6 ${components.storage ? '' : 'text-muted-foreground'}`}
                  style={{ color: components.storage ? rgbColor : undefined }}
                />
                {showBrands && components.storage && (
                  <span className="text-[8px] mt-1 text-center" style={{ color: rgbColor }}>{getBrandNameHTML('storage', components.storage)}</span>
                )}
              </div>
            </div>
            
            <div className={`absolute left-6 top-20 w-12 h-12 ${components.cooling ? 'animate-fade-in' : 'opacity-20'}`}>
              <div className="h-full w-full bg-card/60 border border-border/50 rounded-md flex flex-col items-center justify-center">
                <Fan className={`h-6 w-6 ${components.cooling ? 'animate-spin-slow' : 'text-muted-foreground'}`}
                  style={{ color: components.cooling ? rgbColor : undefined }}
                />
                {showBrands && components.cooling && (
                  <span className="text-[8px] mt-1 text-center" style={{ color: rgbColor }}>{getBrandNameHTML('cooling', components.cooling)}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {buildComplete && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <span 
            className="px-3 py-1 rounded-full text-sm font-medium animate-fade-in rgb-text"
            style={{ backgroundColor: `${rgbColor}20` }}
          >
            Build Complete! 🎉
          </span>
        </div>
      )}
    </div>
  );
};

export default PCBuild3DView;
