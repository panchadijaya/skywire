package main

import (
	"flag"
	"os"
	"os/signal"
	"path/filepath"

	log "github.com/sirupsen/logrus"
	"github.com/skycoin/skycoin/src/util/file"
	"github.com/skycoin/skywire/node"
)

var (
	managerAddresses node.Addresses
	address          string
	// use fixed seed if true
	seed bool
	// path for seed, public key and private key
	seedPath string
)

func parseFlags() {
	flag.StringVar(&address, "address", ":5000", "address to listen on")
	flag.BoolVar(&seed, "seed", true, "use fixed seed to connect if true")
	flag.StringVar(&seedPath, "seedPath", "", "path to save seed info(default:$HOME/.skywire/node/keys.json)")
	flag.Var(&managerAddresses, "manager-address", "address of node manager")
	flag.Parse()
}

func main() {
	parseFlags()

	osSignal := make(chan os.Signal, 1)
	signal.Notify(osSignal, os.Interrupt, os.Kill)

	var n *node.Node
	if !seed {
		n = node.New("")
	} else {
		if len(seedPath) < 1 {
			seedPath = filepath.Join(file.UserHome(), ".skywire", "node", "keys.json")
		}
		n = node.New(seedPath)
	}
	err := n.Start(managerAddresses, address)
	if err != nil {
		log.Error(err)
		os.Exit(1)
	}
	log.Debugf("listen on %s", address)

	select {
	case signal := <-osSignal:
		if signal == os.Interrupt {
			log.Debugln("exit by signal Interrupt")
		} else if signal == os.Kill {
			log.Debugln("exit by signal Kill")
		}
	}
}