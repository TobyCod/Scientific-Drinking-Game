import UIKit
import Capacitor

// Bridge-Controller der App: meldet die native Tab-Leiste an und passt
// ihre Hoehe nach jedem Layout an (Rotation, Safe Area).
class MainViewController: CAPBridgeViewController {
    private let nativeTabs = NativeTabsPlugin()

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        bridge?.registerPluginInstance(nativeTabs)
    }

    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        nativeTabs.updateLayout()
    }
}
