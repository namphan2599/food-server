package config

import (
	"github.com/spf13/viper"
)

type Config struct {
	MongoURI       string `mapstructure:"MONGO_URI"`
	StripeSecretKey string `mapstructure:"STRIPE_SECRET_KEY"`
	Port           string `mapstructure:"PORT"`
}

func LoadConfig() (config Config, err error) {
	viper.SetConfigFile(".env")
	viper.AutomaticEnv()

	err = viper.ReadInConfig()
	if err != nil {
		return
	}

	err = viper.Unmarshal(&config)
	return
}
