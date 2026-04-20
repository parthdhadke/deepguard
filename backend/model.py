"""
MesoNet: Lightweight CNN for Deepfake Detection
Paper: "MesoNet: a Compact Facial Video Forgery Detection Network" (2018)
"""

import torch
import torch.nn as nn


class MesoNet(nn.Module):
    """
    MesoNet architecture for deepfake detection.
    
    Architecture:
    - 4 convolutional blocks with increasing filters (8, 8, 16, 16)
    - Each block: Conv2d -> ReLU -> BatchNorm2d -> MaxPool2d
    - Fully connected layers with dropout for classification
    
    Args:
        num_classes (int): Number of output classes (default: 2 for real/fake)
    """
    
    def __init__(self, num_classes: int = 2):
        super(MesoNet, self).__init__()
        
        # Feature extractor (Convolutional layers)
        self.features = nn.Sequential(
            # Block 1: Input 150x150x3 -> Output 75x75x8
            nn.Conv2d(3, 8, kernel_size=3, padding=1),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(8),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 2: Input 75x75x8 -> Output 37x37x8
            nn.Conv2d(8, 8, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(8),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 3: Input 37x37x8 -> Output 18x18x16
            nn.Conv2d(8, 16, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(16),
            nn.MaxPool2d(kernel_size=2, stride=2),
            
            # Block 4: Input 18x18x16 -> Output 9x9x16
            nn.Conv2d(16, 16, kernel_size=5, padding=2),
            nn.ReLU(inplace=True),
            nn.BatchNorm2d(16),
            nn.MaxPool2d(kernel_size=2, stride=2),
        )
        
        # Classifier (Fully connected layers)
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(16 * 9 * 9, 16),  # 1296 -> 16
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(16, num_classes)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass through the network.
        
        Args:
            x (torch.Tensor): Input tensor of shape (batch_size, 3, 150, 150)
        
        Returns:
            torch.Tensor: Output logits of shape (batch_size, num_classes)
        """
        x = self.features(x)
        x = self.classifier(x)
        return x


if __name__ == "__main__":
    # Test the model architecture
    model = MesoNet(num_classes=2)
    
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    
    print("="*60)
    print("MesoNet Architecture Verification")
    print("="*60)
    print(f"Total parameters: {total_params:,}")
    print(f"Trainable parameters: {trainable_params:,}")
    
    # Test forward pass
    dummy_input = torch.randn(1, 3, 150, 150)
    output = model(dummy_input)
    print(f"\nInput shape: {dummy_input.shape}")
    print(f"Output shape: {output.shape}")
    
    assert output.shape == (1, 2), "Output shape mismatch!"
    
    print("\n✓ Model architecture verified successfully!")
    print("="*60)
