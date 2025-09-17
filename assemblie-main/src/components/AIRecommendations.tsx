import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cpu, HardDrive, Zap, Fan, Layers, Package2, MemoryStick, Microchip, Star, Award, Brain, Lightbulb, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  getComponentDetails, 
  formatPrice, 
  getRecommendedBuilds, 
  type BuildRecommendation,
  type ComponentType
} from "@/utils/componentPricing";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AIRecommendationsProps {
  buildType: string;
  budget: string;
  currentSelection: {
    processor?: string;
    graphics?: string;
    memory?: string;
    storage?: string;
    cooling?: string;
    power?: string;
    motherboard?: string;
    pcCase?: string;
  };
  onSelectRecommendation: (component: string, value: string) => void;
  showRecommendations: boolean;
}

interface RecommendationItemProps {
  title: string;
  currentComponent?: string;
  recommendedComponent: string;
  icon: React.ReactNode;
  onSelect: () => void;
  reasonText?: string;
  performanceScore?: number;
}

interface BuildOption {
  processor: string;
  graphics: string;
  memory: string;
  storage: string;
  cooling: string;
  power: string;
  motherboard: string;
  pcCase: string;
  reasons: Record<string, string>;
  performanceScores?: Record<string, number>;
}

const AIRecommendations: React.FC<AIRecommendationsProps> = ({ 
  buildType, 
  budget, 
  currentSelection,
  onSelectRecommendation,
  showRecommendations 
}) => {
  if (!showRecommendations) {
    return null;
  }

  const [expanded, setExpanded] = useState(false);
  const [learningMode, setLearningMode] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("recommended");
  const [budgetPresets, setBudgetPresets] = useState<BuildRecommendation[]>([]);
  
  const getBudgetAmount = (): number => {
    switch(budget) {
      case 'budget': return 60000;
      case 'midrange': return 120000;
      case 'highend': return 200000;
      case 'extreme': return 300000;
      default: return 120000;
    }
  };

  useEffect(() => {
    if (buildType && budget) {
      const budgetAmount = getBudgetAmount();
      const presets = getRecommendedBuilds(buildType, budgetAmount);
      setBudgetPresets(presets);
    }
  }, [buildType, budget]);
  
  const getRecommendations = (): BuildOption => {
    if (buildType === 'gaming') {
      if (budget === 'budget') {
        return {
          processor: 'i5-12400f',
          graphics: 'rtx3060',
          memory: 'ddr4-16gb',
          storage: 'nvme-1tb',
          cooling: 'air-basic',
          power: 'psu-650w',
          motherboard: 'b660',
          pcCase: 'case-mid',
          reasons: {
            processor: 'Great price-to-performance for budget gaming',
            graphics: 'Entry-level RTX card with DLSS support for better frame rates',
            memory: 'Sufficient for most modern games with some multitasking',
            storage: 'Fast load times for games with decent capacity',
            cooling: 'Adequate for moderate gaming sessions without throttling',
            power: 'Reliable power for mid-range components with headroom',
            motherboard: 'Good features without breaking the bank, supports future upgrades',
            pcCase: 'Good airflow for gaming components with some RGB'
          },
          performanceScores: {
            processor: 65,
            graphics: 70,
            memory: 60,
            storage: 75,
            cooling: 60,
            power: 70,
            motherboard: 65,
            pcCase: 60
          }
        };
      } else if (budget === 'midrange') {
        return {
          processor: 'i5-13600k',
          graphics: 'rtx4070',
          memory: 'ddr5-32gb',
          storage: 'nvme-2tb',
          cooling: 'aio-240mm',
          power: 'psu-850w',
          motherboard: 'z690',
          pcCase: 'case-premium',
          reasons: {
            processor: 'Excellent gaming performance with good overclocking potential',
            graphics: 'Great 1440p/4K gaming with ray tracing and DLSS 3 support',
            memory: 'Future-proof with DDR5 technology and enough for any game',
            storage: 'Ample space for large game libraries with fast load times',
            cooling: 'Better thermal performance for overclocking and sustained loads',
            power: 'Headroom for GPU power spikes during intense gaming sessions',
            motherboard: 'Overclocking support and better VRMs for stability',
            pcCase: 'Better cooling, RGB aesthetics, and cable management'
          },
          performanceScores: {
            processor: 85,
            graphics: 88,
            memory: 85,
            storage: 90,
            cooling: 82,
            power: 85,
            motherboard: 87,
            pcCase: 85
          }
        };
      } else {
        return {
          processor: 'i9-13900k',
          graphics: 'rtx4090',
          memory: 'ddr5-64gb',
          storage: 'nvme-2tb',
          cooling: 'aio-360mm',
          power: 'psu-1000w',
          motherboard: 'z690',
          pcCase: 'case-enthusiast',
          reasons: {
            processor: 'Top-tier gaming performance with many cores for streaming/multitasking',
            graphics: 'Best gaming GPU for 4K, ray tracing, and future-proof for years',
            memory: 'Maximum capacity for multitasking while gaming and content creation',
            storage: 'Ultra-fast game loading and ample space for large collections',
            cooling: 'Maximum cooling for high-end components under full load',
            power: 'Stable power for the most demanding components with OC headroom',
            motherboard: 'Premium features, robust power delivery, and future expansion',
            pcCase: 'Maximum airflow, space for components, and premium aesthetics'
          },
          performanceScores: {
            processor: 98,
            graphics: 100,
            memory: 100,
            storage: 93,
            cooling: 95,
            power: 95,
            motherboard: 92,
            pcCase: 95
          }
        };
      }
    } else if (buildType === 'workstation') {
      if (budget === 'budget') {
        return {
          processor: 'r7-5800x3d',
          graphics: 'rtx3060',
          memory: 'ddr4-32gb',
          storage: 'nvme-2tb',
          cooling: 'air-premium',
          power: 'psu-750w',
          motherboard: 'b550',
          pcCase: 'case-mid',
          reasons: {
            processor: 'High core count for productivity tasks with 3D V-Cache for specialized workloads',
            graphics: 'CUDA cores for content creation with decent rendering performance',
            memory: 'Sufficient for most professional workloads including VMs and editing',
            storage: 'Space for large project files with good read/write speeds',
            cooling: 'Reliable cooling for sustained workloads with low noise',
            power: 'Clean power for stability in long renders and calculations',
            motherboard: 'Good connectivity for peripherals and expansion cards',
            pcCase: 'Good airflow for long workloads with dust filtration'
          },
          performanceScores: {
            processor: 80,
            graphics: 70,
            memory: 80,
            storage: 85,
            cooling: 75,
            power: 80,
            motherboard: 75,
            pcCase: 70
          }
        };
      } else if (budget === 'midrange') {
        return {
          processor: 'r9-7950x',
          graphics: 'rtx4070',
          memory: 'ddr5-64gb',
          storage: 'nvme-2tb',
          cooling: 'aio-360mm',
          power: 'psu-850w',
          motherboard: 'x570',
          pcCase: 'case-premium',
          reasons: {
            processor: 'Excellent multi-threaded performance for professional applications',
            graphics: 'Strong for 3D modeling, video editing, and computation tasks',
            memory: 'Handle large datasets and complex projects without bottlenecks',
            storage: 'Fast storage for project files, samples, and virtual machines',
            cooling: 'Keeps temperatures low during sustained workloads for stability',
            power: 'Stable power delivery for professional work with good efficiency',
            motherboard: 'Professional features, PCIe 4.0, and multiple expansion slots',
            pcCase: 'Good acoustic dampening for quiet operation in work environments'
          },
          performanceScores: {
            processor: 95,
            graphics: 85,
            memory: 100,
            storage: 90,
            cooling: 90,
            power: 88,
            motherboard: 90,
            pcCase: 85
          }
        };
      } else {
        return {
          processor: 'r9-7950x',
          graphics: 'rtx4090',
          memory: 'ddr5-64gb',
          storage: 'nvme-2tb',
          cooling: 'aio-360mm',
          power: 'psu-1000w',
          motherboard: 'x570',
          pcCase: 'case-enthusiast',
          reasons: {
            processor: 'Maximum cores for professional workloads like rendering and simulation',
            graphics: 'Fastest rendering and compute performance for professional tasks',
            memory: 'No bottlenecks for any memory-intensive tasks including AI work',
            storage: 'Ultra-fast project loading and scratch disk performance',
            cooling: 'Optimal cooling for 24/7 workloads with consistent performance',
            power: 'Reliable power for mission-critical work with clean delivery',
            motherboard: 'Maximum connectivity, stability, and professional features',
            pcCase: 'Optimal airflow for workstation components with good accessibility'
          },
          performanceScores: {
            processor: 95,
            graphics: 100,
            memory: 100,
            storage: 93,
            cooling: 95,
            power: 95,
            motherboard: 93,
            pcCase: 95
          }
        };
      }
    } else if (buildType === 'streaming') {
      if (budget === 'budget') {
        return {
          processor: 'i5-12400f',
          graphics: 'rtx3060',
          memory: 'ddr4-16gb',
          storage: 'nvme-1tb',
          cooling: 'air-premium',
          power: 'psu-650w',
          motherboard: 'b660',
          pcCase: 'case-mid',
          reasons: {
            processor: 'Decent cores for streaming at entry level with good single-core',
            graphics: 'NVENC encoder for streaming without CPU load at 1080p',
            memory: 'Enough for game and streaming software simultaneously',
            storage: 'Space for game library and VOD recordings at reasonable cost',
            cooling: 'Keeps system cool during long streams with low noise',
            power: 'Reliable power for streaming components with efficiency',
            motherboard: 'Good connectivity for streaming peripherals like capture cards',
            pcCase: 'Decent acoustics and aesthetics for on-camera presence'
          },
          performanceScores: {
            processor: 70,
            graphics: 75,
            memory: 65,
            storage: 75,
            cooling: 75,
            power: 70,
            motherboard: 70,
            pcCase: 65
          }
        };
      } else if (budget === 'midrange') {
        return {
          processor: 'i7-13700k',
          graphics: 'rtx4070',
          memory: 'ddr5-32gb',
          storage: 'nvme-2tb',
          cooling: 'aio-360mm',
          power: 'psu-850w',
          motherboard: 'z690',
          pcCase: 'case-premium',
          reasons: {
            processor: 'Excellent for gaming while encoding streams with many cores',
            graphics: 'NVENC encoder for high-quality streams up to 4K with AV1 support',
            memory: 'Handle game, stream, and background apps without stuttering',
            storage: 'Space for game library and VOD recordings in high quality',
            cooling: 'Keeps system cool during long streams with consistent performance',
            power: 'Reliable power for streaming setups with good transient response',
            motherboard: 'Good connectivity for streaming peripherals and expansion',
            pcCase: 'Good acoustics for stream audio quality and camera-friendly design'
          },
          performanceScores: {
            processor: 90,
            graphics: 88,
            memory: 90,
            storage: 90,
            cooling: 90,
            power: 85,
            motherboard: 87,
            pcCase: 85
          }
        };
      } else {
        return {
          processor: 'i9-13900k',
          graphics: 'rtx4090',
          memory: 'ddr5-64gb',
          storage: 'nvme-2tb',
          cooling: 'aio-360mm',
          power: 'psu-1000w',
          motherboard: 'z690',
          pcCase: 'case-enthusiast',
          reasons: {
            processor: 'Top-tier performance for simultaneous gaming and streaming',
            graphics: 'Best-in-class NVENC with AV1 for professional-quality streams',
            memory: 'Run game, stream, recording, and editing software simultaneously',
            storage: 'Ultra-fast game loading and ample space for content creation',
            cooling: 'Maximum cooling for high-end components during marathon streams',
            power: 'Stable power for the most demanding streaming and gaming setup',
            motherboard: 'Premium features for complex streaming setups and capture',
            pcCase: 'Studio-ready aesthetics with excellent acoustics and thermal design'
          },
          performanceScores: {
            processor: 98,
            graphics: 100,
            memory: 100,
            storage: 93,
            cooling: 95,
            power: 95,
            motherboard: 92,
            pcCase: 95
          }
        };
      }
    } else if (buildType === 'office') {
      if (budget === 'budget') {
        return {
          processor: 'i3-12100f',
          graphics: 'integrated',
          memory: 'ddr4-8gb',
          storage: 'ssd-500gb',
          cooling: 'stock',
          power: 'psu-450w',
          motherboard: 'h610',
          pcCase: 'case-budget',
          reasons: {
            processor: 'Energy-efficient with good single-core for office applications',
            graphics: 'Integrated graphics sufficient for document work and web browsing',
            memory: 'Adequate for basic office tasks with light multitasking',
            storage: 'Fast boot and application loading with suitable capacity',
            cooling: 'Quiet operation for office environment with low heat output',
            power: 'Energy-efficient for daily use with good reliability',
            motherboard: 'Essential connectivity for office peripherals at low cost',
            pcCase: 'Compact and professional appearance with minimal footprint'
          },
          performanceScores: {
            processor: 50,
            graphics: 30,
            memory: 40,
            storage: 60,
            cooling: 40,
            power: 50,
            motherboard: 45,
            pcCase: 40
          }
        };
      } else if (budget === 'midrange') {
        return {
          processor: 'i5-12400f',
          graphics: 'integrated',
          memory: 'ddr4-16gb',
          storage: 'ssd-1tb',
          cooling: 'air-basic',
          power: 'psu-550w',
          motherboard: 'b660',
          pcCase: 'case-mid',
          reasons: {
            processor: 'Efficient performance for office tasks with good multitasking',
            graphics: 'Integrated graphics for multiple displays and light media work',
            memory: 'Smooth multitasking for office applications and browser tabs',
            storage: 'Ample space for documents, software, and local backups',
            cooling: 'Quiet operation with better thermal headroom for longevity',
            power: 'Reliable power with good efficiency for all-day operation',
            motherboard: 'Better connectivity options with USB 3.0 and expansion',
            pcCase: 'Professional design with good dust filtering and quiet operation'
          },
          performanceScores: {
            processor: 70,
            graphics: 40,
            memory: 70,
            storage: 80,
            cooling: 60,
            power: 65,
            motherboard: 70,
            pcCase: 65
          }
        };
      } else {
        return {
          processor: 'i7-13700k',
          graphics: 'rtx3060',
          memory: 'ddr5-32gb',
          storage: 'nvme-2tb',
          cooling: 'air-premium',
          power: 'psu-650w',
          motherboard: 'z690',
          pcCase: 'case-premium',
          reasons: {
            processor: 'High performance for demanding business applications and VM support',
            graphics: 'Dedicated GPU for CAD, multiple 4K displays, and graphic design',
            memory: 'Extensive multitasking with large datasets and virtual machines',
            storage: 'Ultra-fast storage for database work and large file operations',
            cooling: 'Silent operation with excellent thermal performance',
            power: 'Clean and stable power for professional workloads',
            motherboard: 'Business-class features with security options and connectivity',
            pcCase: 'Premium build quality with noise dampening and clean aesthetics'
          },
          performanceScores: {
            processor: 90,
            graphics: 75,
            memory: 90,
            storage: 93,
            cooling: 85,
            power: 80,
            motherboard: 90,
            pcCase: 85
          }
        };
      }
    } else {
      return {
        processor: 'i5-12400f',
        graphics: 'rtx3060',
        memory: 'ddr4-16gb',
        storage: 'nvme-1tb',
        cooling: 'air-basic',
        power: 'psu-650w',
        motherboard: 'b660',
        pcCase: 'case-mid',
        reasons: {
          processor: 'Good all-around performance for various computing tasks',
          graphics: 'Versatile GPU for gaming, content creation, and general use',
          memory: 'Sufficient for most use cases with good multitasking',
          storage: 'Fast and spacious storage for OS and applications',
          cooling: 'Reliable cooling solution with good acoustics',
          power: 'Sufficient and efficient power supply for system stability',
          motherboard: 'Well-rounded features and connectivity options',
          pcCase: 'Good airflow, aesthetics, and build quality'
        },
        performanceScores: {
          processor: 70,
          graphics: 70,
          memory: 65,
          storage: 75,
          cooling: 65,
          power: 70,
          motherboard: 70,
          pcCase: 65
        }
      };
    }
  };

  const getAlternativeRecommendations = (): BuildOption => {
    if (buildType === 'gaming') {
      if (budget === 'budget') {
        return {
          processor: 'r5-5600x',
          graphics: 'rx6600',
          memory: 'ddr4-16gb',
          storage: 'nvme-1tb',
          cooling: 'air-basic',
          power: 'psu-650w',
          motherboard: 'b550',
          pcCase: 'case-mid',
          reasons: {
            processor: 'AMD alternative with good gaming performance and value',
            graphics: 'AMD alternative with similar performance at potentially better value',
            memory: 'Same recommendation - great value for gaming',
            storage: 'Same recommendation - good balance of speed and capacity',
            cooling: 'Same recommendation - adequate cooling for this build',
            power: 'Same recommendation - sufficient for these components',
            motherboard: 'AMD-compatible motherboard with similar features',
            pcCase: 'Same recommendation - good airflow and value'
          },
          performanceScores: {
            processor: 68,
            graphics: 68,
            memory: 60,
            storage: 75,
            cooling: 60,
            power: 70,
            motherboard: 65,
            pcCase: 60
          }
        };
      } else {
        const mainRecs = getRecommendations();
        return {
          processor: buildType === 'gaming' && budget === 'midrange' ? 'i7-13700k' : mainRecs.processor,
          graphics: buildType === 'gaming' && budget === 'premium' ? 'rtx4080' : mainRecs.graphics,
          memory: mainRecs.memory,
          storage: 'nvme-2tb',
          cooling: budget === 'premium' ? 'aio-360mm' : 'aio-240mm',
          power: mainRecs.power,
          motherboard: mainRecs.motherboard,
          pcCase: mainRecs.pcCase,
          reasons: {
            processor: 'Alternative with potentially better price-to-performance ratio',
            graphics: 'Better value option with only slightly lower performance',
            memory: 'Same recommendation - optimal for this build type',
            storage: 'Same recommendation - important for any build',
            cooling: 'Optimal cooling solution for this configuration',
            power: 'Same recommendation - appropriate for power requirements',
            motherboard: 'Same recommendation - provides required features',
            pcCase: 'Same recommendation - good aesthetics and airflow'
          }
        };
      }
    } else {
      const mainRecs = getRecommendations();
      return {
        processor: buildType === 'workstation' ? 'r9-7950x' : (buildType === 'office' ? 'r5-5600x' : mainRecs.processor),
        graphics: mainRecs.graphics,
        memory: mainRecs.memory,
        storage: mainRecs.storage,
        cooling: mainRecs.cooling,
        power: mainRecs.power,
        motherboard: buildType === 'workstation' || buildType === 'office' ? 'x570' : mainRecs.motherboard,
        pcCase: mainRecs.pcCase,
        reasons: {
          processor: 'AMD alternative that may offer better multi-core performance for your use case',
          graphics: 'Same recommendation - optimal for this build type',
          memory: 'Same recommendation - optimal for this build type',
          storage: 'Same recommendation - important for any build',
          cooling: 'Same recommendation - appropriate for thermal requirements',
          power: 'Same recommendation - appropriate for power requirements',
          motherboard: 'AMD-compatible motherboard with appropriate features',
          pcCase: 'Same recommendation - good balance of features'
        }
      };
    }
  };

  const getValueRecommendations = (): BuildOption => {
    if (buildType === 'gaming') {
      return {
        processor: budget === 'budget' ? 'i3-12100f' : (budget === 'midrange' ? 'i5-12400f' : 'i5-13600k'),
        graphics: budget === 'budget' ? 'gtx1650' : (budget === 'midrange' ? 'rtx3060' : 'rtx4070'),
        memory: budget === 'budget' ? 'ddr4-16gb' : 'ddr4-32gb',
        storage: budget === 'budget' ? 'ssd-1tb' : 'nvme-1tb',
        cooling: budget === 'budget' ? 'stock' : 'air-premium',
        power: budget === 'budget' ? 'psu-650w' : 'psu-750w',
        motherboard: budget === 'budget' ? 'h610' : 'b660',
        pcCase: budget === 'budget' ? 'case-budget' : 'case-mid',
        reasons: {
          processor: 'Excellent price-to-performance ratio for gaming requirements',
          graphics: 'Best value GPU that delivers good framerates without overspending',
          memory: 'Adequate capacity at lower cost than DDR5 alternatives',
          storage: 'Good capacity with reasonable speed at better value than NVMe',
          cooling: 'Effective cooling without the premium of liquid options',
          power: 'Reliable PSU with sufficient wattage at better value point',
          motherboard: 'Essential features without paying for extras you may not use',
          pcCase: 'Functional case with good airflow without premium pricing'
        }
      };
    } else if (buildType === 'workstation') {
      return {
        processor: budget === 'budget' ? 'r5-5600x' : 'r7-5800x3d',
        graphics: budget === 'budget' ? 'rtx3060' : 'rtx4070',
        memory: budget === 'budget' ? 'ddr4-32gb' : 'ddr5-32gb',
        storage: 'nvme-2tb',
        cooling: budget === 'budget' ? 'air-premium' : 'aio-240mm',
        power: 'psu-750w',
        motherboard: 'b550',
        pcCase: 'case-mid',
        reasons: {
          processor: 'Good multi-core performance at a more reasonable price point',
          graphics: 'Adequate CUDA/compute performance without flagship pricing',
          memory: 'High capacity for workstation tasks at better value than maximum configurations',
          storage: 'Essential high-capacity fast storage for workstation productivity',
          cooling: 'Effective cooling for professional workloads without premium pricing',
          power: 'Reliable PSU with sufficient headroom at better value point',
          motherboard: 'Professional features without paying for enthusiast extras',
          pcCase: 'Good airflow and build quality without paying for aesthetics'
        }
      };
    } else {
      const mainRecs = getRecommendations();
      return {
        processor: budget === 'budget' ? 'i3-12100f' : 'i5-12400f',
        graphics: buildType === 'office' ? 'integrated' : 'rtx3060',
        memory: budget === 'budget' ? 'ddr4-16gb' : 'ddr4-32gb',
        storage: budget === 'budget' ? 'ssd-1tb' : 'nvme-1tb',
        cooling: 'air-basic',
        power: budget === 'budget' ? 'psu-450w' : 'psu-650w',
        motherboard: budget === 'budget' ? 'h610' : 'b660',
        pcCase: budget === 'budget' ? 'case-budget' : 'case-mid',
        reasons: {
          processor: 'Good performance for daily tasks without overspending',
          graphics: buildType === 'office' ? 'Integrated graphics sufficient for business use' : 'Good value for casual use',
          memory: 'Sufficient capacity for most users at better price point',
          storage: 'Good balance of speed and capacity at reasonable cost',
          cooling: 'Adequate cooling for typical use patterns',
          power: 'Reliable power supply without unnecessary wattage',
          motherboard: 'Essential connectivity without paying for unused features',
          pcCase: 'Functional and professional without premium pricing'
        }
      };
    }
  };

  const getPerformanceRecommendations = (): BuildOption => {
    if (buildType === 'gaming') {
      return {
        processor: budget === 'budget' ? 'i5-13600k' : 'i7-13700k',
        graphics: budget === 'budget' ? 'rtx3070' : (budget === 'midrange' ? 'rtx4070' : 'rtx4080'),
        memory: budget === 'budget' ? 'ddr4-16gb' : 'ddr5-32gb',
        storage: 'nvme-1tb',
        cooling: budget === 'budget' ? 'air-hyper212' : 'aio-240mm',
        power: budget === 'budget' ? 'psu-750w' : 'psu-850w',
        motherboard: budget === 'budget' ? 'b660' : 'z690',
        pcCase: 'case-airflow',
        reasons: {
          processor: 'Prioritized CPU with better gaming performance and multitasking ability',
          graphics: 'Strong GPU to maximize framerates in modern games',
          memory: 'Sufficient RAM for smooth gaming experience',
          storage: 'Fast NVMe storage for quick game loading',
          cooling: 'Enhanced cooling for sustained high performance',
          power: 'Reliable power delivery for high-end components',
          motherboard: 'Compatible motherboard with gaming features',
          pcCase: 'Case optimized for maximum airflow and cooling'
        }
      };
    } else if (buildType === 'workstation') {
      return {
        processor: budget === 'budget' ? 'r7-7700x' : 'r9-7950x',
        graphics: budget === 'budget' ? 'rtx3070' : 'rtx4080',
        memory: budget === 'budget' ? 'ddr5-32gb' : 'ddr5-64gb',
        storage: 'nvme-2tb',
        cooling: budget === 'budget' ? 'aio-240mm' : 'aio-360mm',
        power: budget === 'budget' ? 'psu-750w' : 'psu-1000w',
        motherboard: budget === 'budget' ? 'x570' : 'x670e',
        pcCase: 'case-premium',
        reasons: {
          processor: 'Maximum multi-core performance for professional workloads',
          graphics: 'Strong GPU compute capabilities for rendering and simulation',
          memory: 'Abundant RAM for complex projects and virtual machines',
          storage: 'Fast storage for large project files',
          cooling: 'High-performance cooling for sustained workloads',
          power: 'Clean and stable power for professional components',
          motherboard: 'Feature-rich motherboard with professional connectivity',
          pcCase: 'Professional-looking case with good thermal performance'
        }
      };
    } else {
      const mainRecs = getRecommendations();
      return {
        ...mainRecs,
        cooling: budget === 'budget' ? 'air-hyper212' : 'aio-240mm',
        power: budget === 'budget' ? 'psu-650w' : 'psu-750w',
        reasons: {
          ...mainRecs.reasons,
          cooling: 'Enhanced cooling system for better performance under load',
          power: 'Better power supply for stability under sustained high load'
        }
      };
    }
  };

  const getBudgetFocusedRecommendations = (): BuildOption => {
    if (buildType === 'gaming') {
      return {
        processor: budget === 'budget' ? 'i3-12100f' : (budget === 'midrange' ? 'i5-12400f' : 'i5-13600k'),
        graphics: budget === 'budget' ? 'rx6600' : (budget === 'midrange' ? 'rx6700xt' : 'rtx4070'),
        memory: 'ddr4-16gb',
        storage: budget === 'budget' ? 'ssd-1tb' : 'nvme-1tb',
        cooling: 'air-basic',
        power: budget === 'budget' ? 'psu-550w' : 'psu-650w',
        motherboard: budget === 'budget' ? 'h610' : 'b660',
        pcCase: 'case-mid',
        reasons: {
          processor: 'Good gaming performance at a lower price point',
          graphics: 'Excellent price-to-performance ratio for gaming',
          memory: 'Sufficient RAM for most games at a reasonable price',
          storage: 'Good storage solution without overspending',
          cooling: 'Adequate cooling at budget-friendly price',
          power: 'Reliable power supply with good value',
          motherboard: 'Cost-effective motherboard with essential features',
          pcCase: 'Practical case with good value and airflow'
        }
      };
    } else {
      return {
        processor: budget === 'budget' ? 'i3-12100f' : 'i5-12400f',
        graphics: buildType === 'office' ? 'integrated' : (budget === 'budget' ? 'gtx1650' : 'rtx3060'),
        memory: buildType === 'workstation' ? 'ddr4-32gb' : 'ddr4-16gb',
        storage: budget === 'budget' ? 'ssd-1tb' : 'nvme-1tb',
        cooling: 'air-basic',
        power: budget === 'budget' ? 'psu-450w' : 'psu-550w',
        motherboard: budget === 'budget' ? 'h610' : 'b660',
        pcCase: 'case-budget',
        reasons: {
          processor: 'Balanced CPU performance at an affordable price',
          graphics: buildType === 'office' ? 'Integrated graphics sufficient for daily tasks' : 'Dedicated GPU with good value',
          memory: 'Adequate RAM capacity for your needs',
          storage: 'Cost-effective storage solution with good capacity',
          cooling: 'Simple cooling solution that gets the job done',
          power: 'Budget-friendly power supply with sufficient wattage',
          motherboard: 'Basic motherboard with essential connectivity',
          pcCase: 'Simple and functional case at a great price'
        }
      };
    }
  };

  const recommendations = getRecommendations();
  const alternativeRecs = getAlternativeRecommendations();
  const valueRecs = getValueRecommendations();
  const performanceRecs = getPerformanceRecommendations();
  const budgetFocusedRecs = getBudgetFocusedRecommendations();
  
  const getActiveRecommendations = (): BuildOption => {
    switch (activeTab) {
      case 'alternative':
        return alternativeRecs;
      case 'value':
        return valueRecs;
      case 'performance':
        return performanceRecs;
      case 'budget':
        return budgetFocusedRecs;
      case 'recommended':
      default:
        return recommendations;
    }
  };
  
  const getComponentIcon = (componentType: string) => {
    switch (componentType) {
      case 'processor':
        return <Cpu className="h-4 w-4" />;
      case 'graphics':
        return <Microchip className="h-4 w-4" />;
      case 'memory':
        return <MemoryStick className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'cooling':
        return <Fan className="h-4 w-4" />;
      case 'power':
        return <Zap className="h-4 w-4" />;
      case 'motherboard':
        return <Layers className="h-4 w-4" />;
      case 'pcCase':
        return <Package2 className="h-4 w-4" />;
      default:
        return <Cpu className="h-4 w-4" />;
    }
  };
  
  const RecommendationItem: React.FC<RecommendationItemProps> = ({ 
    title, 
    currentComponent, 
    recommendedComponent,
    icon,
    onSelect,
    reasonText,
    performanceScore
  }) => {
    const currentDetails = currentComponent ? getComponentDetails(title as any, currentComponent) : null;
    const recommendedDetails = getComponentDetails(title as any, recommendedComponent);
    
    const isCurrentBetter = currentDetails && recommendedDetails && 
      currentDetails.price > recommendedDetails.price;
    
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent/10 rounded-full">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium">{recommendedDetails?.name}</p>
              <p className="text-xs text-muted-foreground">{formatPrice(recommendedDetails?.price || 0)}</p>
              {performanceScore && learningMode && (
                <div className="w-16 h-1.5 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-accent" 
                    style={{ width: `${performanceScore}%` }}
                  ></div>
                </div>
              )}
            </div>
          </div>
          
          {!currentComponent && (
            <Button size="sm" variant="outline" className="h-8" onClick={onSelect}>
              Add
            </Button>
          )}
          
          {currentComponent && currentComponent !== recommendedComponent && !isCurrentBetter && (
            <Button size="sm" variant="outline" className="h-8" onClick={onSelect}>
              Upgrade
            </Button>
          )}
          
          {currentComponent && currentComponent === recommendedComponent && (
            <Badge variant="outline" className="bg-accent/10 text-accent">
              Selected
            </Badge>
          )}
          
          {isCurrentBetter && (
            <Badge variant="outline" className="bg-secondary/50">
              You have better
            </Badge>
          )}
        </div>
        
        {reasonText && learningMode && (
          <div className="pl-8 pr-2 pb-2">
            <p className="text-xs text-muted-foreground italic">{reasonText}</p>
          </div>
        )}
      </div>
    );
  };

  const toggleLearningMode = () => {
    setLearningMode(!learningMode);
    if (!learningMode) {
      toast.success("AI learning mode activated! Showing detailed recommendations.");
    } else {
      toast.info("AI learning mode deactivated.");
    }
  };

  const activeRecommendations = getActiveRecommendations();
  const recommendationEntries = Object.entries(activeRecommendations).filter(([key]) => key !== 'reasons' && key !== 'performanceScores');
  const reasonsEntries = activeRecommendations.reasons ? Object.entries(activeRecommendations.reasons) : [];
  const reasonsMap = reasonsEntries.reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
  
  const performanceScoresMap = activeRecommendations.performanceScores || {};
  
  const BudgetPresetCard = ({ preset }: { preset: BuildRecommendation }) => {
    return (
      <div className="border border-border rounded-lg p-4 hover:border-accent/50 hover:bg-card/50 transition-all">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-sm">{preset.name}</h4>
          <Badge className="bg-accent/20 text-accent border-0 text-xs">
            {formatPrice(preset.totalPrice)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
        <div className="grid grid-cols-2 gap-1">
          {Object.entries(preset.components).slice(0, 4).map(([component, id]) => {
            const details = getComponentDetails(component as any, id);
            return (
              <div key={component} className="flex items-center gap-1 text-xs">
                {getComponentIcon(component)}
                <span className="truncate">{details?.name.split(' ')[0]}</span>
              </div>
            );
          })}
        </div>
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full mt-3 text-xs"
          onClick={() => {
            Object.entries(preset.components).forEach(([component, id]) => {
              if (typeof id === 'string') {
                onSelectRecommendation(component, id);
              }
            });
            toast.success(`Budget preset "${preset.name}" applied!`);
          }}
        >
          Apply Preset
        </Button>
      </div>
    );
  };

  return (
    <Card className="mt-6 bg-card/50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              AI Recommendations
              <Badge className="bg-accent/20 text-accent border-0 text-xs">v2.1</Badge>
            </CardTitle>
            <CardDescription>
              Based on your {buildType} build with {budget} budget
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={toggleLearningMode}
          >
            {learningMode ? <Star className="h-4 w-4" /> : <Brain className="h-4 w-4" />}
            {learningMode ? "Basic" : "Learning"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {budgetPresets.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5" /> Budget Presets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {budgetPresets.map((preset, index) => (
                <BudgetPresetCard key={index} preset={preset} />
              ))}
            </div>
            <Separator className="my-4" />
          </div>
        )}
      
        <Tabs defaultValue="recommended" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4">
            <TabsTrigger value="recommended" className="text-xs">
              <Award className="h-3 w-3 mr-1" /> Recommended
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs">
              <Zap className="h-3 w-3 mr-1" /> Performance
            </TabsTrigger>
            <TabsTrigger value="value" className="text-xs">
              <Star className="h-3 w-3 mr-1" /> Value
            </TabsTrigger>
            <TabsTrigger value="budget" className="text-xs">
              <DollarSign className="h-3 w-3 mr-1" /> Budget
            </TabsTrigger>
            <TabsTrigger value="alternative" className="text-xs">
              <Lightbulb className="h-3 w-3 mr-1" /> Alternative
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="recommended" className="mt-0">
            <div className="space-y-1">
              {recommendationEntries
                .slice(0, expanded ? undefined : 4)
                .map(([component, value]) => (
                  <RecommendationItem
                    key={component}
                    title={component}
                    currentComponent={currentSelection[component as keyof typeof currentSelection]}
                    recommendedComponent={value as string}
                    icon={getComponentIcon(component)}
                    onSelect={() => onSelectRecommendation(component, value as string)}
                    reasonText={reasonsMap[component]}
                    performanceScore={performanceScoresMap[component]}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="performance" className="mt-0">
            <div className="space-y-1">
              {recommendationEntries
                .slice(0, expanded ? undefined : 4)
                .map(([component, value]) => (
                  <RecommendationItem
                    key={component}
                    title={component}
                    currentComponent={currentSelection[component as keyof typeof currentSelection]}
                    recommendedComponent={value as string}
                    icon={getComponentIcon(component)}
                    onSelect={() => onSelectRecommendation(component, value as string)}
                    reasonText={reasonsMap[component]}
                    performanceScore={performanceScoresMap[component]}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="budget" className="mt-0">
            <div className="space-y-1">
              {recommendationEntries
                .slice(0, expanded ? undefined : 4)
                .map(([component, value]) => (
                  <RecommendationItem
                    key={component}
                    title={component}
                    currentComponent={currentSelection[component as keyof typeof currentSelection]}
                    recommendedComponent={value as string}
                    icon={getComponentIcon(component)}
                    onSelect={() => onSelectRecommendation(component, value as string)}
                    reasonText={reasonsMap[component]}
                    performanceScore={performanceScoresMap[component]}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="alternative" className="mt-0">
            <div className="space-y-1">
              {recommendationEntries
                .slice(0, expanded ? undefined : 4)
                .map(([component, value]) => (
                  <RecommendationItem
                    key={component}
                    title={component}
                    currentComponent={currentSelection[component as keyof typeof currentSelection]}
                    recommendedComponent={value as string}
                    icon={getComponentIcon(component)}
                    onSelect={() => onSelectRecommendation(component, value as string)}
                    reasonText={reasonsMap[component]}
                    performanceScore={performanceScoresMap[component]}
                  />
                ))}
            </div>
          </TabsContent>
          
          <TabsContent value="value" className="mt-0">
            <div className="space-y-1">
              {recommendationEntries
                .slice(0, expanded ? undefined : 4)
                .map(([component, value]) => (
                  <RecommendationItem
                    key={component}
                    title={component}
                    currentComponent={currentSelection[component as keyof typeof currentSelection]}
                    recommendedComponent={value as string}
                    icon={getComponentIcon(component)}
                    onSelect={() => onSelectRecommendation(component, value as string)}
                    reasonText={reasonsMap[component]}
                    performanceScore={performanceScoresMap[component]}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {!expanded && recommendationEntries.length > 4 && (
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-muted-foreground text-xs" 
            onClick={() => setExpanded(true)}
          >
            Show more recommendations
          </Button>
        )}
        
        {expanded && (
          <Button 
            variant="ghost" 
            className="w-full mt-2 text-muted-foreground text-xs" 
            onClick={() => setExpanded(false)}
          >
            Show less
          </Button>
        )}
      </CardContent>
      <Separator className="opacity-50" />
      <CardFooter className="flex justify-between pt-4">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => {
            recommendationEntries
              .forEach(([component, value]) => onSelectRecommendation(component, value as string));
            toast.success(`All ${activeTab} recommendations applied!`);
          }}
        >
          Apply All Recommendations
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AIRecommendations;
