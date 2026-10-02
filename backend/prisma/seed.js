require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function findOrCreate(model, where, data) {
  const existing = await model.findFirst({ where });
  return existing || model.create({ data });
}

async function main() {
  const categoryData = [
    ["Hardware", "End-user and data-center hardware"],
    ["Software", "Business and productivity software"],
    ["Cloud Services", "Hosted infrastructure and platform services"],
    ["Networking", "Network connectivity and infrastructure"],
    ["Cybersecurity", "Security software and appliances"],
    ["Office Equipment", "Shared workplace and printing equipment"],
    ["Business Services", "Subscriptions and managed services"],
    ["Telecommunications", "Connectivity and mobile communications"],
    ["Facilities", "Workplace and building services"]
  ];
  const categories = {};
  for (const [name, description] of categoryData) {
    categories[name] = await findOrCreate(prisma.productCategory, { categoryName: name }, { categoryName: name, description });
  }

  const childCategoryData = [
    ["Laptops", "Hardware", "Business laptops and notebooks"], ["Desktops & Workstations", "Hardware", "Desktop computers and workstations"],
    ["Monitors & Displays", "Hardware", "Professional displays and signage"], ["Docking & Accessories", "Hardware", "Docks, peripherals, and accessories"],
    ["Data Center Infrastructure", "Hardware", "Servers and data-center equipment"], ["Storage & Data Protection", "Hardware", "Storage and data protection hardware"],
    ["Printing & Imaging", "Office Equipment", "Printers, scanners, and imaging equipment"], ["Meeting Room Equipment", "Office Equipment", "Video and meeting-room equipment"],
    ["Network Switching", "Networking", "Managed switches and campus networking"], ["Wireless Networking", "Networking", "Wireless access and management"],
    ["Network Management", "Networking", "Network management platforms"], ["Firewalls & Network Security", "Cybersecurity", "Firewalls and network security"],
    ["Endpoint Security", "Cybersecurity", "Endpoint protection platforms"], ["Identity & Access Management", "Cybersecurity", "Identity and access controls"],
    ["Email Security", "Cybersecurity", "Email security and awareness"], ["Backup & Recovery", "Software", "Backup and recovery software"],
    ["Developer Tools", "Software", "Developer platforms and tooling"], ["ERP & CRM", "Software", "Enterprise resource planning and CRM"],
    ["IT Service Management", "Software", "IT service-management platforms"], ["Infrastructure as a Service", "Cloud Services", "Cloud compute infrastructure"],
    ["Cloud Database", "Cloud Services", "Managed cloud databases"], ["Cloud Security", "Cloud Services", "Cloud security platforms"],
    ["Collaboration & Communications", "Business Services", "Collaboration and communications"], ["Managed IT & Professional Services", "Business Services", "Managed technology services"],
    ["Research & Advisory", "Business Services", "Research and advisory subscriptions"], ["Business Internet", "Telecommunications", "Business internet connectivity"],
    ["Unified Communications", "Telecommunications", "Voice and unified communications"], ["Workplace Services", "Facilities", "Workplace and facilities services"]
  ];
  for (const [name, parent, description] of childCategoryData) {
    categories[name] = await findOrCreate(prisma.productCategory, { categoryName: name }, { categoryName: name, parentCategoryId: categories[parent].id, description });
  }

  const brandNames = [
    ["Microsoft", "https://www.microsoft.com"], ["Lenovo", "https://www.lenovo.com"], ["Dell", "https://www.dell.com"],
    ["AWS", "https://aws.amazon.com"], ["Bloomberg", "https://www.bloomberg.com"], ["HP", "https://www.hp.com"],
    ["Apple", "https://www.apple.com"], ["Samsung", "https://www.samsung.com"], ["Logitech", "https://www.logitech.com"],
    ["Cisco", "https://www.cisco.com"], ["Ubiquiti", "https://ui.com"], ["Fortinet", "https://www.fortinet.com"],
    ["Synology", "https://www.synology.com"], ["APC", "https://www.apc.com"], ["Adobe", "https://www.adobe.com"],
    ["Zoom", "https://zoom.us"], ["Slack", "https://slack.com"], ["Atlassian", "https://www.atlassian.com"],
    ["CrowdStrike", "https://www.crowdstrike.com"], ["Okta", "https://www.okta.com"], ["GitHub", "https://github.com"],
    ["Google", "https://workspace.google.com"], ["Oracle", "https://www.oracle.com"], ["SAP", "https://www.sap.com"],
    ["DocuSign", "https://www.docusign.com"], ["ServiceNow", "https://www.servicenow.com"], ["Salesforce", "https://www.salesforce.com"],
    ["DHL", "https://www.dhl.com"], ["Gartner", "https://www.gartner.com"], ["Challenger", "https://www.challenger.com.au"],
    ["Acer", "https://www.acer.com"], ["Poly", "https://www.hp.com/poly"], ["Brother", "https://www.brother.com"],
    ["Cloudflare", "https://www.cloudflare.com"], ["Veeam", "https://www.veeam.com"], ["Telstra", "https://www.telstra.com"]
  ];
  const brands = {};
  for (const [name, website] of brandNames) {
    brands[name] = await findOrCreate(prisma.brand, { brandName: name }, { brandName: name, manufacturerWebsite: website });
  }

  const additionalBrands = [
    ["VMware", "https://www.vmware.com"], ["IBM", "https://www.ibm.com"], ["HPE", "https://www.hpe.com"], ["Juniper Networks", "https://www.juniper.net"],
    ["Palo Alto Networks", "https://www.paloaltonetworks.com"], ["NetApp", "https://www.netapp.com"], ["Pure Storage", "https://www.purestorage.com"],
    ["Nutanix", "https://www.nutanix.com"], ["Red Hat", "https://www.redhat.com"], ["Canon", "https://global.canon"], ["Epson", "https://global.epson.com"],
    ["Xerox", "https://www.xerox.com"], ["Ricoh", "https://www.ricoh.com"], ["Eaton", "https://www.eaton.com"], ["Arista", "https://www.arista.com"],
    ["Sophos", "https://www.sophos.com"], ["Zscaler", "https://www.zscaler.com"], ["Proofpoint", "https://www.proofpoint.com"], ["Rubrik", "https://www.rubrik.com"],
    ["Cohesity", "https://www.cohesity.com"], ["Twilio", "https://www.twilio.com"], ["RingCentral", "https://www.ringcentral.com"], ["Dropbox", "https://www.dropbox.com"],
    ["Asana", "https://asana.com"], ["Monday.com", "https://monday.com"]
  ];
  for (const [name, website] of additionalBrands) brands[name] = await findOrCreate(prisma.brand, { brandName: name }, { brandName: name, manufacturerWebsite: website });

  const vendors = {};
  const vendorData = [
    ["Microsoft", "Software Provider", "United States", "LOW"], ["Lenovo", "Hardware Manufacturer", "China", "MEDIUM"],
    ["Dell", "Hardware Manufacturer", "United States", "LOW"], ["AWS", "Cloud Provider", "United States", "LOW"],
    ["Bloomberg", "Financial Data Provider", "United States", "MEDIUM"], ["HP", "Hardware Manufacturer", "United States", "LOW"],
    ["Apple", "Hardware Manufacturer", "United States", "LOW"], ["Cisco", "Networking Provider", "United States", "LOW"],
    ["Fortinet", "Cybersecurity Provider", "United States", "MEDIUM"], ["Challenger", "IT Solutions Provider", "Australia", "MEDIUM"],
    ["Google", "Cloud and Software Provider", "United States", "LOW"], ["Oracle", "Database Provider", "United States", "MEDIUM"],
    ["SAP", "ERP Provider", "Germany", "MEDIUM"], ["Salesforce", "Business Software Provider", "United States", "LOW"],
    ["Acer", "Hardware Manufacturer", "Taiwan", "MEDIUM"], ["Telstra", "Telecommunications Provider", "Australia", "MEDIUM"],
    ["Samsung", "Display Manufacturer", "South Korea", "LOW"], ["Cloudflare", "Cybersecurity Provider", "United States", "LOW"],
    ["Adobe", "Software Provider", "United States", "LOW"], ["Zoom", "Collaboration Provider", "United States", "LOW"],
    ["Slack", "Collaboration Provider", "United States", "LOW"], ["ServiceNow", "Service Management Provider", "United States", "MEDIUM"],
    ["Atlassian", "Software Provider", "Australia", "LOW"]
  ];
  for (const [name, vendorType, country, riskRating] of vendorData) {
    vendors[name] = await findOrCreate(prisma.vendor, { vendorName: name }, { vendorName: name, vendorType, country, currency: "USD", riskRating });
  }

  const additionalVendors = [
    ["CDW", "IT Reseller", "United States", "LOW", "https://www.cdw.com"], ["Insight", "IT Reseller", "United States", "LOW", "https://www.insight.com"],
    ["SHI", "IT Reseller", "United States", "LOW", "https://www.shi.com"], ["IBM", "Technology Provider", "United States", "LOW", "https://www.ibm.com"],
    ["Veeam", "Backup Provider", "Switzerland", "LOW", "https://www.veeam.com"], ["VMware", "Cloud Software Provider", "United States", "MEDIUM", "https://www.vmware.com"],
    ["Palo Alto Networks", "Cybersecurity Provider", "United States", "MEDIUM", "https://www.paloaltonetworks.com"], ["Juniper Networks", "Networking Provider", "United States", "LOW", "https://www.juniper.net"],
    ["HPE", "Hardware Manufacturer", "United States", "LOW", "https://www.hpe.com"], ["Eaton", "Power Infrastructure Provider", "Ireland", "LOW", "https://www.eaton.com"],
    ["Ricoh", "Office Equipment Manufacturer", "Japan", "LOW", "https://www.ricoh.com"], ["Canon", "Office Equipment Manufacturer", "Japan", "LOW", "https://global.canon"],
    ["Epson", "Office Equipment Manufacturer", "Japan", "LOW", "https://global.epson.com"], ["Xerox", "Office Equipment Manufacturer", "United States", "LOW", "https://www.xerox.com"],
    ["Equinix", "Data Center Provider", "United States", "MEDIUM", "https://www.equinix.com"], ["NTT", "Telecommunications Provider", "Japan", "MEDIUM", "https://www.global.ntt"],
    ["Singtel", "Telecommunications Provider", "Singapore", "MEDIUM", "https://www.singtel.com"], ["StarHub", "Telecommunications Provider", "Singapore", "MEDIUM", "https://www.starhub.com"],
    ["Kyndryl", "Managed Services Provider", "United States", "MEDIUM", "https://www.kyndryl.com"], ["Rackspace Technology", "Cloud Services Provider", "United States", "MEDIUM", "https://www.rackspace.com"],
    ["Red Hat", "Software Provider", "United States", "LOW", "https://www.redhat.com"], ["Nutanix", "Cloud Software Provider", "United States", "MEDIUM", "https://www.nutanix.com"],
    ["Pure Storage", "Storage Manufacturer", "United States", "LOW", "https://www.purestorage.com"], ["NetApp", "Storage Manufacturer", "United States", "LOW", "https://www.netapp.com"],
    ["Zscaler", "Cybersecurity Provider", "United States", "MEDIUM", "https://www.zscaler.com"], ["Rubrik", "Backup Provider", "United States", "MEDIUM", "https://www.rubrik.com"],
    ["Cohesity", "Backup Provider", "United States", "MEDIUM", "https://www.cohesity.com"], ["Sophos", "Cybersecurity Provider", "United Kingdom", "MEDIUM", "https://www.sophos.com"],
    ["Proofpoint", "Email Security Provider", "United States", "MEDIUM", "https://www.proofpoint.com"], ["Twilio", "Communications Provider", "United States", "LOW", "https://www.twilio.com"],
    ["RingCentral", "Communications Provider", "United States", "LOW", "https://www.ringcentral.com"], ["Dropbox", "Collaboration Provider", "United States", "LOW", "https://www.dropbox.com"],
    ["Asana", "Work Management Provider", "United States", "LOW", "https://asana.com"], ["Monday.com", "Work Management Provider", "Israel", "LOW", "https://monday.com"]
  ];
  for (const [name, vendorType, country, riskRating, website] of additionalVendors) {
    vendors[name] = await findOrCreate(prisma.vendor, { vendorName: name }, { vendorName: name, vendorType, country, website, currency: "USD", riskRating });
  }

  const contacts = [
    ["Microsoft", "Sarah Mitchell", "Account Executive", "sarah.mitchell@microsoft.example"], ["Lenovo", "Daniel Chen", "Enterprise Sales Manager", "daniel.chen@lenovo.example"],
    ["Dell", "Priya Shah", "Account Manager", "priya.shah@dell.example"], ["AWS", "James Wilson", "Cloud Account Manager", "james.wilson@aws.example"],
    ["Bloomberg", "Emily Carter", "Relationship Manager", "emily.carter@bloomberg.example"], ["HP", "Owen Brooks", "Commercial Account Manager", "owen.brooks@hp.example"],
    ["Challenger", "Mia Thompson", "Solutions Consultant", "mia.thompson@challenger.example"], ["Google", "Noah Patel", "Cloud Specialist", "noah.patel@google.example"],
    ["Oracle", "Grace Liu", "Technology Account Manager", "grace.liu@oracle.example"], ["SAP", "Lucas Meyer", "Account Executive", "lucas.meyer@sap.example"],
    ["Acer", "Hannah Cole", "Commercial Sales Manager", "hannah.cole@acer.example"], ["Telstra", "Jack Nguyen", "Business Account Manager", "jack.nguyen@telstra.example"]
  ];
  for (const [vendor, name, role, email] of contacts) {
    const existing = await prisma.vendorContact.findFirst({ where: { vendorId: vendors[vendor].id, email } });
    if (!existing) await prisma.vendorContact.create({ data: { vendorId: vendors[vendor].id, name, role, email, primaryContact: true } });
  }

  for (const vendorName of Object.keys(vendors)) {
    const vendor = vendors[vendorName];
    const contactCount = await prisma.vendorContact.count({ where: { vendorId: vendor.id } });
    if (contactCount === 0) {
      await prisma.vendorContact.create({ data: { vendorId: vendor.id, name: `${vendorName} Account Team`, role: "Account Manager", email: `${vendorName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.account@vendor.example`, primaryContact: true, notes: "Generated prototype contact" } });
    }
  }

  for (const vendor of Object.values(vendors)) {
    const contactCount = await prisma.vendorContact.count({ where: { vendorId: vendor.id } });
    if (contactCount === 0) {
      const emailName = vendor.vendorName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await prisma.vendorContact.create({
        data: {
          vendorId: vendor.id,
          name: `${vendor.vendorName} Account Team`,
          role: "Account Manager",
          email: `${emailName}.account@vendor.example`,
          primaryContact: true,
          notes: "Generated prototype contact"
        }
      });
    }
  }

  const productData = [
    ["Microsoft 365 E5", "Software", "Microsoft", "Enterprise productivity and security subscription"],
    ["Azure", "Cloud Services", "Microsoft", "Cloud computing platform"],
    ["Lenovo ThinkPad T14", "Hardware", "Lenovo", "Business laptop"],
    ["Dell Latitude", "Hardware", "Dell", "Business laptop"],
    ["AWS EC2", "Cloud Services", "AWS", "Elastic cloud compute service"],
    ["Bloomberg Terminal", "Software", "Bloomberg", "Financial markets data and analytics terminal"],
    ["Dell UltraSharp U2723QE", "Hardware", "Dell", "27-inch 4K USB-C professional monitor"],
    ["Dell P2422H", "Hardware", "Dell", "24-inch Full HD business monitor"],
    ["Dell WD22TB4 Dock", "Hardware", "Dell", "Thunderbolt docking station for business laptops"],
    ["Dell PowerEdge R760", "Hardware", "Dell", "Two-socket enterprise rack server"],
    ["Lenovo ThinkCentre M90q", "Hardware", "Lenovo", "Compact business desktop"],
    ["Lenovo ThinkVision P27h", "Hardware", "Lenovo", "27-inch QHD USB-C monitor"],
    ["HP EliteBook 840 G10", "Hardware", "HP", "Premium business notebook"],
    ["HP LaserJet Pro 4003dn", "Office Equipment", "HP", "Monochrome network laser printer"],
    ["HP Color LaserJet Pro MFP 4301", "Office Equipment", "HP", "Colour multifunction office printer"],
    ["Apple MacBook Air M3", "Hardware", "Apple", "Lightweight productivity laptop"],
    ["Apple iPhone 15", "Hardware", "Apple", "Corporate mobile device"],
    ["Samsung 55-inch Commercial Display", "Office Equipment", "Samsung", "Digital signage and meeting-room display"],
    ["Logitech MX Keys for Business", "Hardware", "Logitech", "Wireless business keyboard"],
    ["Logitech Brio 4K Webcam", "Hardware", "Logitech", "4K conference webcam"],
    ["Cisco Catalyst 9200", "Networking", "Cisco", "Managed access switch"],
    ["Cisco Meraki MR46", "Networking", "Cisco", "Cloud-managed wireless access point"],
    ["Ubiquiti UniFi Dream Machine Pro", "Networking", "Ubiquiti", "Network gateway and security appliance"],
    ["Ubiquiti UniFi U6 Pro", "Networking", "Ubiquiti", "Wi-Fi 6 access point"],
    ["FortiGate 60F", "Cybersecurity", "Fortinet", "Next-generation firewall"],
    ["FortiClient EMS", "Cybersecurity", "Fortinet", "Endpoint security management platform"],
    ["Synology RackStation RS1221+", "Hardware", "Synology", "Network attached storage appliance"],
    ["APC Smart-UPS 1500VA", "Office Equipment", "APC", "Uninterruptible power supply"],
    ["Windows 11 Pro", "Software", "Microsoft", "Business desktop operating system"],
    ["Microsoft Entra ID P1", "Cybersecurity", "Microsoft", "Cloud identity and access management"],
    ["Power BI Pro", "Software", "Microsoft", "Business intelligence and reporting subscription"],
    ["Adobe Acrobat Pro", "Software", "Adobe", "PDF creation and document workflow software"],
    ["Zoom Workplace Pro", "Business Services", "Zoom", "Video meetings and collaboration subscription"],
    ["Slack Business+", "Business Services", "Slack", "Team messaging and collaboration subscription"],
    ["Jira Software Premium", "Software", "Atlassian", "Project and issue tracking platform"],
    ["CrowdStrike Falcon Pro", "Cybersecurity", "CrowdStrike", "Endpoint detection and response service"],
    ["Okta Workforce Identity", "Cybersecurity", "Okta", "Workforce single sign-on and identity service"],
    ["GitHub Enterprise Cloud", "Software", "GitHub", "Source control and developer collaboration platform"],
    ["Amazon S3", "Cloud Services", "AWS", "Object storage service"],
    ["Amazon RDS", "Cloud Services", "AWS", "Managed relational database service"],
    ["AWS Lambda", "Cloud Services", "AWS", "Serverless compute service"],
    ["Google Workspace Business Standard", "Business Services", "Google", "Email, storage, and office collaboration suite"],
    ["Oracle Database Standard Edition", "Software", "Oracle", "Enterprise relational database software"],
    ["SAP Business One", "Software", "SAP", "Small and mid-sized business ERP platform"],
    ["DocuSign Business Pro", "Business Services", "DocuSign", "Electronic signature and agreement workflow"],
    ["ServiceNow ITSM", "Business Services", "ServiceNow", "IT service management platform"],
    ["Salesforce Sales Cloud", "Business Services", "Salesforce", "Customer relationship management platform"],
    ["DHL IT Asset Disposal", "Business Services", "DHL", "Certified IT equipment collection and disposal service"],
    ["Gartner IT Research Subscription", "Business Services", "Gartner", "Technology research and advisory subscription"],
    ["Challenger Managed IT Support", "Business Services", "Challenger", "Help desk, onsite support, and managed services"],
    ["Acer TravelMate P4", "Hardware", "Acer", "Business laptop for mobile teams"],
    ["Poly Studio P5", "Hardware", "Poly", "USB video conference camera"],
    ["Brother MFC-L8900CDW", "Office Equipment", "Brother", "Colour multifunction printer"],
    ["Cloudflare Zero Trust", "Cybersecurity", "Cloudflare", "Zero trust network access service"],
    ["Veeam Data Platform", "Software", "Veeam", "Backup and recovery platform"],
    ["Telstra Business Internet", "Telecommunications", "Telstra", "Business internet connectivity service"],
    ["Google Cloud Compute Engine", "Cloud Services", "Google", "Cloud virtual machine service"],
    ["Oracle Cloud Database", "Cloud Services", "Oracle", "Managed cloud database service"],
    ["SAP SuccessFactors", "Business Services", "SAP", "Cloud human resources platform"],
    ["Salesforce Service Cloud", "Business Services", "Salesforce", "Customer service management platform"]
  ];

  const products = {};
  for (const [model, category, brand, description] of productData) {
    products[model] = await findOrCreate(
      prisma.product,
      { model },
      { model, categoryId: categories[category].id, brandId: brands[brand].id, description, lifecycleStatus: "ACTIVE" }
    );
  }

  const additionalProductData = [
    ["VMware Cloud Foundation", "Cloud Services", "VMware"], ["VMware vSphere Foundation", "Cloud Services", "VMware"], ["VMware NSX", "Networking", "VMware"], ["VMware Tanzu Platform", "Software", "VMware"],
    ["IBM watsonx", "Software", "IBM"], ["IBM Power E1080", "Data Center Infrastructure", "IBM"], ["IBM FlashSystem 9500", "Storage & Data Protection", "IBM"], ["IBM Consulting Hybrid Cloud Services", "Managed IT & Professional Services", "IBM"],
    ["HPE ProLiant DL380 Gen11", "Data Center Infrastructure", "HPE"], ["HPE Alletra 6000", "Storage & Data Protection", "HPE"], ["HPE Aruba Networking CX 6300", "Network Switching", "HPE"], ["HPE GreenLake Private Cloud", "Cloud Services", "HPE"],
    ["Juniper EX4400", "Network Switching", "Juniper Networks"], ["Juniper QFX5120", "Network Switching", "Juniper Networks"], ["Juniper Mist AP45", "Wireless Networking", "Juniper Networks"], ["Juniper SRX345", "Firewalls & Network Security", "Juniper Networks"],
    ["Palo Alto PA-440", "Firewalls & Network Security", "Palo Alto Networks"], ["Palo Alto Prisma Access", "Cloud Security", "Palo Alto Networks"], ["Palo Alto Cortex XDR Pro", "Endpoint Security", "Palo Alto Networks"], ["Palo Alto Prisma Cloud", "Cloud Security", "Palo Alto Networks"],
    ["NetApp AFF A250", "Storage & Data Protection", "NetApp"], ["NetApp AFF A400", "Storage & Data Protection", "NetApp"], ["NetApp StorageGRID", "Storage & Data Protection", "NetApp"], ["NetApp BlueXP Backup and Recovery", "Backup & Recovery", "NetApp"],
    ["Pure Storage FlashArray X20", "Storage & Data Protection", "Pure Storage"], ["Pure Storage FlashArray C40", "Storage & Data Protection", "Pure Storage"], ["Pure Storage FlashBlade", "Storage & Data Protection", "Pure Storage"], ["Pure1 Management", "Network Management", "Pure Storage"],
    ["Nutanix Cloud Infrastructure", "Cloud Services", "Nutanix"], ["Nutanix Cloud Manager", "Cloud Services", "Nutanix"], ["Nutanix Unified Storage", "Storage & Data Protection", "Nutanix"], ["Nutanix Database Service", "Cloud Database", "Nutanix"],
    ["Red Hat Enterprise Linux", "Software", "Red Hat"], ["Red Hat OpenShift Platform Plus", "Cloud Services", "Red Hat"], ["Red Hat Ansible Automation Platform", "Developer Tools", "Red Hat"], ["Red Hat Satellite", "Network Management", "Red Hat"],
    ["Canon imageRUNNER ADVANCE DX C3935i", "Printing & Imaging", "Canon"], ["Canon imageCLASS X MF1538C", "Printing & Imaging", "Canon"], ["Canon DR-G2140", "Printing & Imaging", "Canon"], ["Canon MAXIFY GX7070", "Printing & Imaging", "Canon"],
    ["Epson WorkForce Enterprise AM-C6000", "Printing & Imaging", "Epson"], ["Epson WorkForce Pro WF-C5890", "Printing & Imaging", "Epson"], ["Epson DS-870", "Printing & Imaging", "Epson"], ["Epson EB-L630U", "Meeting Room Equipment", "Epson"],
    ["Xerox VersaLink C625", "Printing & Imaging", "Xerox"], ["Xerox AltaLink C8235", "Printing & Imaging", "Xerox"], ["Xerox B410", "Printing & Imaging", "Xerox"], ["Xerox DocuMate 6440", "Printing & Imaging", "Xerox"],
    ["Ricoh IM C4510", "Printing & Imaging", "Ricoh"], ["Ricoh M C320FW", "Printing & Imaging", "Ricoh"], ["Ricoh fi-8170", "Printing & Imaging", "Ricoh"], ["Ricoh Interactive Whiteboard A6500", "Meeting Room Equipment", "Ricoh"],
    ["Eaton 9PX 3000i", "Data Center Infrastructure", "Eaton"], ["Eaton 5PX Gen2 2200VA", "Data Center Infrastructure", "Eaton"], ["Eaton ePDU G3 Managed", "Data Center Infrastructure", "Eaton"], ["Eaton Intelligent Power Manager", "Network Management", "Eaton"],
    ["Arista 7050X4 Series", "Network Switching", "Arista"], ["Arista 720XP Series", "Network Switching", "Arista"], ["Arista 7500R3 Series", "Network Switching", "Arista"], ["Arista CloudVision", "Network Management", "Arista"],
    ["Sophos XGS 136", "Firewalls & Network Security", "Sophos"], ["Sophos Intercept X Advanced", "Endpoint Security", "Sophos"], ["Sophos Central", "Endpoint Security", "Sophos"], ["Sophos ZTNA", "Identity & Access Management", "Sophos"],
    ["Zscaler Internet Access", "Cloud Security", "Zscaler"], ["Zscaler Private Access", "Identity & Access Management", "Zscaler"], ["Zscaler Digital Experience", "Cloud Security", "Zscaler"], ["Zscaler Data Protection", "Cloud Security", "Zscaler"],
    ["Proofpoint Core Email Protection", "Email Security", "Proofpoint"], ["Proofpoint Security Awareness Training", "Email Security", "Proofpoint"], ["Proofpoint Enterprise DLP", "Cybersecurity", "Proofpoint"], ["Proofpoint Insider Threat Management", "Cybersecurity", "Proofpoint"],
    ["Rubrik Security Cloud", "Backup & Recovery", "Rubrik"], ["Rubrik Cloud Vault", "Backup & Recovery", "Rubrik"], ["Rubrik NAS Cloud Direct", "Backup & Recovery", "Rubrik"], ["Rubrik Microsoft 365 Protection", "Backup & Recovery", "Rubrik"],
    ["Cohesity Data Cloud", "Backup & Recovery", "Cohesity"], ["Cohesity DataProtect", "Backup & Recovery", "Cohesity"], ["Cohesity FortKnox", "Backup & Recovery", "Cohesity"], ["Cohesity SmartFiles", "Storage & Data Protection", "Cohesity"],
    ["Twilio Programmable Voice", "Unified Communications", "Twilio"], ["Twilio Programmable Messaging", "Unified Communications", "Twilio"], ["Twilio Flex", "Unified Communications", "Twilio"], ["Twilio Segment", "ERP & CRM", "Twilio"],
    ["RingEX", "Unified Communications", "RingCentral"], ["RingCX", "Unified Communications", "RingCentral"], ["RingCentral Rooms", "Meeting Room Equipment", "RingCentral"], ["RingCentral Webinar", "Collaboration & Communications", "RingCentral"],
    ["Dropbox Business Plus", "Collaboration & Communications", "Dropbox"], ["Dropbox Sign Premium", "Collaboration & Communications", "Dropbox"], ["Dropbox Replay", "Collaboration & Communications", "Dropbox"], ["Dropbox Backup", "Backup & Recovery", "Dropbox"],
    ["Asana Starter", "Collaboration & Communications", "Asana"], ["Asana Advanced", "Collaboration & Communications", "Asana"], ["Asana Enterprise", "Collaboration & Communications", "Asana"], ["Asana Enterprise+", "Collaboration & Communications", "Asana"],
    ["monday work management Standard", "Collaboration & Communications", "Monday.com"], ["monday work management Pro", "Collaboration & Communications", "Monday.com"], ["monday CRM Pro", "ERP & CRM", "Monday.com"], ["monday service Pro", "IT Service Management", "Monday.com"]
  ];
  for (const [model, category, brand] of additionalProductData) {
    products[model] = await findOrCreate(prisma.product, { model }, { model, categoryId: categories[category].id, brandId: brands[brand].id, description: `${brand} ${model} product or service`, lifecycleStatus: "ACTIVE" });
  }

  const mappings = [
    ["Microsoft", "Microsoft 365 E5"], ["Microsoft", "Azure"], ["Microsoft", "Windows 11 Pro"], ["Microsoft", "Power BI Pro"],
    ["Lenovo", "Lenovo ThinkPad T14"], ["Lenovo", "Lenovo ThinkCentre M90q"], ["Dell", "Dell Latitude"], ["Dell", "Dell UltraSharp U2723QE"],
    ["Dell", "Dell P2422H"], ["Dell", "Dell WD22TB4 Dock"], ["HP", "HP EliteBook 840 G10"], ["HP", "HP LaserJet Pro 4003dn"],
    ["AWS", "AWS EC2"], ["AWS", "Amazon S3"], ["AWS", "Amazon RDS"], ["AWS", "AWS Lambda"], ["Cisco", "Cisco Catalyst 9200"],
    ["Cisco", "Cisco Meraki MR46"], ["Fortinet", "FortiGate 60F"], ["Challenger", "Challenger Managed IT Support"],
    ["Challenger", "Dell UltraSharp U2723QE"], ["Challenger", "Lenovo ThinkPad T14"], ["Bloomberg", "Bloomberg Terminal"]
    , ["Google", "Google Cloud Compute Engine"], ["Oracle", "Oracle Cloud Database"], ["SAP", "SAP SuccessFactors"],
    ["Salesforce", "Salesforce Service Cloud"], ["Acer", "Acer TravelMate P4"], ["Telstra", "Telstra Business Internet"],
    ["Challenger", "Poly Studio P5"], ["Challenger", "Brother MFC-L8900CDW"]
  ];
  for (const [vendorName, model] of mappings) {
    await prisma.vendorProduct.upsert({
      where: { vendorId_productId: { vendorId: vendors[vendorName].id, productId: products[model].id } },
      update: {},
      create: { vendorId: vendors[vendorName].id, productId: products[model].id, authorisedReseller: true, leadTimeDays: 14 }
    });
  }

  const manufacturerVendors = ["VMware", "IBM", "HPE", "Juniper Networks", "Palo Alto Networks", "NetApp", "Pure Storage", "Nutanix", "Red Hat", "Canon", "Epson", "Xerox", "Ricoh", "Eaton", "Veeam", "Zscaler"];
  for (const vendorName of manufacturerVendors) {
    const brandProducts = Object.values(products).filter((product) => product.brandId === brands[vendorName]?.id);
    for (const product of brandProducts) {
      await prisma.vendorProduct.upsert({
        where: { vendorId_productId: { vendorId: vendors[vendorName].id, productId: product.id } },
        update: { notes: "Synthetic prototype supplier relationship" },
        create: { vendorId: vendors[vendorName].id, productId: product.id, authorisedReseller: false, leadTimeDays: 21, warrantyMonths: 36, moq: 1, notes: "Synthetic prototype supplier relationship" }
      });
    }
  }

  const resellerVendors = ["CDW", "Insight", "SHI", "Challenger"];
  const resellerBrands = ["Dell", "Lenovo", "HP", "Microsoft", "Cisco", "Fortinet", "HPE", "Juniper Networks", "VMware", "Veeam", "Red Hat", "Adobe"];
  for (const vendorName of resellerVendors) {
    for (const brandName of resellerBrands) {
      const brandProducts = Object.values(products).filter((product) => product.brandId === brands[brandName]?.id).slice(0, 8);
      for (const product of brandProducts) {
        await prisma.vendorProduct.upsert({
          where: { vendorId_productId: { vendorId: vendors[vendorName].id, productId: product.id } },
          update: { notes: "Synthetic prototype supplier relationship" },
          create: { vendorId: vendors[vendorName].id, productId: product.id, authorisedReseller: false, leadTimeDays: 14, warrantyMonths: 24, moq: 1, notes: "Synthetic prototype supplier relationship" }
        });
      }
    }
  }

  const rfqs = {};
  const rfqItems = {};
  const rfqData = [
    ["RFQ-2026-001", "Workplace Technology", "OPEN", "Hardware", "Refresh monitors for the 2026 workplace program", [["Dell UltraSharp U2723QE", 60]], ["Dell", "Challenger", "HP"]],
    ["RFQ-2026-002", "IT Operations", "CLOSED", "Hardware", "Source laptops for new starters", [["Lenovo ThinkPad T14", 30], ["Acer TravelMate P4", 15]], ["Lenovo", "Challenger", "Acer"]],
    ["RFQ-2026-003", "Cloud Platform Team", "OPEN", "Cloud Services", "Compare managed compute and database services", [["AWS EC2", 12], ["Google Cloud Compute Engine", 12], ["Oracle Cloud Database", 2]], ["AWS", "Google", "Oracle"]],
    ["RFQ-2026-004", "Network Engineering", "AWARDED", "Networking", "Upgrade wireless access points", [["Cisco Meraki MR46", 25], ["Ubiquiti UniFi U6 Pro", 25]], ["Cisco", "Challenger"]],
    ["RFQ-2026-005", "Workplace Technology", "OPEN", "Hardware", "Standardise displays across regional offices", [["Dell P2422H", 80], ["Lenovo ThinkVision P27h", 30], ["Samsung 55-inch Commercial Display", 6]], ["Dell", "Lenovo", "Samsung", "HP", "Challenger"]],
    ["RFQ-2026-006", "People and Culture", "OPEN", "Hardware", "Equip the next employee intake", [["Lenovo ThinkPad T14", 45], ["HP EliteBook 840 G10", 25], ["Acer TravelMate P4", 20], ["Apple MacBook Air M3", 10]], ["Lenovo", "HP", "Acer", "Apple", "Challenger"]],
    ["RFQ-2026-007", "Security Operations", "CLOSED", "Cybersecurity", "Refresh perimeter and endpoint security controls", [["FortiGate 60F", 4], ["FortiClient EMS", 250], ["Cloudflare Zero Trust", 250]], ["Fortinet", "Cloudflare", "Challenger", "Cisco"]],
    ["RFQ-2026-008", "Corporate Services", "AWARDED", "Software", "Renew collaboration and document productivity tools", [["Microsoft 365 E5", 250], ["Adobe Acrobat Pro", 80], ["Zoom Workplace Pro", 250], ["Slack Business+", 150]], ["Microsoft", "Adobe", "Zoom", "Slack", "Challenger"]],
    ["RFQ-2026-009", "Cloud Platform Team", "OPEN", "Cloud Services", "Compare cloud storage and database capacity", [["Amazon S3", 12], ["Amazon RDS", 4], ["Google Cloud Compute Engine", 12], ["Oracle Cloud Database", 2]], ["AWS", "Google", "Oracle", "Challenger"]],
    ["RFQ-2026-010", "Service Management", "OPEN", "Business Services", "Source service management and CRM platforms", [["ServiceNow ITSM", 1], ["Jira Software Premium", 120], ["Salesforce Service Cloud", 25], ["Challenger Managed IT Support", 12]], ["ServiceNow", "Atlassian", "Salesforce", "Challenger"]],
    ["RFQ-2026-011", "Workplace Technology", "CLOSED", "Laptops", "Laptop refresh", [["Lenovo ThinkPad T14", 30], ["HP EliteBook 840 G10", 25], ["Acer TravelMate P4", 15]], ["Lenovo", "HP", "Acer", "Challenger"]],
    ["RFQ-2026-012", "Executive Office", "OPEN", "Laptops", "Executive laptop refresh", [["Apple MacBook Air M3", 10], ["Lenovo ThinkPad T14", 10], ["HP EliteBook 840 G10", 10]], ["Apple", "Lenovo", "HP", "Challenger"]],
    ["RFQ-2026-013", "Workplace Technology", "CLOSED", "Monitors & Displays", "Monitor refresh", [["Dell UltraSharp U2723QE", 50], ["Lenovo ThinkVision P27h", 25], ["Samsung 55-inch Commercial Display", 4]], ["Dell", "Challenger", "CDW", "Insight"]],
    ["RFQ-2026-014", "Cloud Platform Team", "CLOSED", "Cloud Services", "Cloud platform benchmark", [["AWS EC2", 12], ["Google Cloud Compute Engine", 12], ["Oracle Cloud Database", 2]], ["AWS", "Google", "Oracle", "Rackspace Technology"]],
    ["RFQ-2026-015", "Security Operations", "OPEN", "Cybersecurity", "Security platform", [["FortiGate 60F", 4], ["Palo Alto PA-440", 4], ["Cloudflare Zero Trust", 250]], ["Fortinet", "Palo Alto Networks", "Cloudflare", "Challenger", "CDW"]],
    ["RFQ-2026-016", "Corporate Services", "OPEN", "Business Services", "Collaboration renewal", [["Zoom Workplace Pro", 250], ["Slack Business+", 150], ["Asana Advanced", 80]], ["Zoom", "Slack", "Asana", "Challenger"]],
    ["RFQ-2026-017", "Customer Operations", "CLOSED", "ERP & CRM", "CRM and workflow", [["Salesforce Sales Cloud", 30], ["Twilio Segment", 1], ["monday CRM Pro", 30]], ["Salesforce", "Twilio", "Monday.com", "Insight"]],
    ["RFQ-2026-018", "Data Center Team", "OPEN", "Data Center Infrastructure", "Data center refresh", [["HPE ProLiant DL380 Gen11", 8], ["IBM Power E1080", 2], ["Eaton 9PX 3000i", 8]], ["HPE", "IBM", "Eaton", "CDW"]],
    ["RFQ-2026-019", "Storage Team", "OPEN", "Storage & Data Protection", "Storage refresh", [["NetApp AFF A250", 4], ["Pure Storage FlashArray X20", 4], ["IBM FlashSystem 9500", 2]], ["NetApp", "Pure Storage", "IBM", "SHI"]],
    ["RFQ-2026-020", "Security Operations", "CLOSED", "Backup & Recovery", "Backup and cyber recovery", [["Veeam Data Platform", 1], ["Rubrik Security Cloud", 1], ["Cohesity Data Cloud", 1]], ["Veeam", "Rubrik", "Cohesity", "Challenger"]],
    ["RFQ-2026-021", "Network Engineering", "OPEN", "Network Switching", "Campus switching", [["Juniper EX4400", 20], ["HPE Aruba Networking CX 6300", 20], ["Arista 7050X4 Series", 6]], ["Juniper Networks", "HPE", "Challenger", "CDW"]],
    ["RFQ-2026-022", "Network Engineering", "OPEN", "Wireless Networking", "Wireless refresh", [["Juniper Mist AP45", 30], ["Cisco Meraki MR46", 30], ["HPE Aruba Networking CX 6300", 10]], ["Juniper Networks", "Cisco", "HPE", "Insight"]],
    ["RFQ-2026-023", "Security Operations", "CLOSED", "Endpoint Security", "Endpoint and email security", [["Sophos Intercept X Advanced", 250], ["Proofpoint Core Email Protection", 250], ["Palo Alto Cortex XDR Pro", 250]], ["Sophos", "Palo Alto Networks", "Challenger", "SHI"]],
    ["RFQ-2026-024", "Cloud Platform Team", "OPEN", "Cloud Services", "Private cloud", [["VMware Cloud Foundation", 1], ["Nutanix Cloud Infrastructure", 1], ["Red Hat OpenShift Platform Plus", 1]], ["VMware", "Nutanix", "Red Hat", "IBM"]],
    ["RFQ-2026-025", "Corporate Services", "OPEN", "Printing & Imaging", "Managed print", [["Canon imageRUNNER ADVANCE DX C3935i", 8], ["Ricoh IM C4510", 8], ["Xerox AltaLink C8235", 8]], ["Canon", "Ricoh", "Xerox", "CDW"]],
    ["RFQ-2026-026", "Corporate Services", "OPEN", "Collaboration & Communications", "Work management", [["Asana Advanced", 80], ["monday work management Pro", 80], ["Dropbox Business Plus", 80]], ["Asana", "Monday.com", "Dropbox", "Insight"]],
    ["RFQ-2026-027", "Customer Operations", "CLOSED", "Unified Communications", "Unified communications", [["RingEX", 150], ["Twilio Programmable Voice", 150], ["Zoom Workplace Pro", 150]], ["RingCentral", "Twilio", "Zoom", "Telstra"]],
    ["RFQ-2026-028", "IT Operations", "OPEN", "Managed IT & Professional Services", "Managed infrastructure services", [["IBM Consulting Hybrid Cloud Services", 12], ["Challenger Managed IT Support", 12], ["Veeam Data Platform", 1]], ["IBM", "Kyndryl", "Rackspace Technology", "Challenger"]],
    ["RFQ-2026-029", "Security Operations", "OPEN", "Cloud Security", "Zero trust", [["Zscaler Private Access", 250], ["Palo Alto Prisma Access", 250], ["Sophos ZTNA", 250]], ["Zscaler", "Palo Alto Networks", "Sophos", "Challenger"]],
    ["RFQ-2026-030", "Data Protection Team", "CLOSED", "Backup & Recovery", "SaaS protection", [["Rubrik Microsoft 365 Protection", 1], ["Cohesity DataProtect", 1], ["Veeam Data Platform", 1], ["Dropbox Backup", 80]], ["Rubrik", "Cohesity", "Veeam", "Challenger"]]
  ];
  for (const [rfqNumber, requestedBy, status, category, businessJustification, items, vendorNames] of rfqData) {
    rfqs[rfqNumber] = await prisma.rFQ.findUnique({ where: { rfqNumber } });
    if (!rfqs[rfqNumber]) {
      rfqs[rfqNumber] = await prisma.rFQ.create({
        data: {
          rfqNumber,
          requestedBy,
          status,
          categoryId: categories[category].id,
          closingDate: new Date("2026-12-15"),
          businessJustification
        }
      });
    }
    for (const [model, quantity] of items) {
      const key = `${rfqNumber}:${model}`;
      rfqItems[key] = await prisma.rFQItem.findFirst({ where: { rfqId: rfqs[rfqNumber].id, productId: products[model].id } });
      if (!rfqItems[key]) {
        rfqItems[key] = await prisma.rFQItem.create({ data: { rfqId: rfqs[rfqNumber].id, productId: products[model].id, quantity } });
      }
    }
    for (const vendorName of vendorNames) {
      const existingVendor = await prisma.rFQVendor.findFirst({ where: { rfqId: rfqs[rfqNumber].id, vendorId: vendors[vendorName].id } });
      const responseStatus = status === "AWARDED" && vendorName === vendorNames[0] ? "ACCEPTED" : status === "OPEN" ? "PENDING" : "RESPONDED";
      if (!existingVendor) {
        await prisma.rFQVendor.create({ data: { rfqId: rfqs[rfqNumber].id, vendorId: vendors[vendorName].id, responseStatus } });
      } else {
        await prisma.rFQVendor.update({ where: { id: existingVendor.id }, data: { responseStatus } });
      }
    }
    if (status !== "OPEN") {
      for (const [model, quantity] of items) {
        for (const vendorName of vendorNames) {
          const item = rfqItems[`${rfqNumber}:${model}`];
          const existingQuote = await prisma.quote.findFirst({ where: { rfqId: rfqs[rfqNumber].id, rfqItemId: item.id, vendorId: vendors[vendorName].id } });
          if (!existingQuote) {
            const unitPrice = (150 + products[model].id * 17 + vendors[vendorName].id * 9).toFixed(2);
            await prisma.quote.create({
              data: {
                rfqId: rfqs[rfqNumber].id,
                rfqItemId: item.id,
                vendorId: vendors[vendorName].id,
                productId: products[model].id,
                quoteDate: new Date("2026-09-25"),
                quantity,
                unitPrice,
                currency: "USD",
                leadTimeDays: 14 + (vendors[vendorName].id % 7),
                validityDate: new Date("2026-10-25"),
                notes: status === "AWARDED" && vendorName === vendorNames[0] ? "Awarded supplier quote" : "Submitted RFQ response"
              }
            });
          }
        }
      }
    }
  }

  const allRfqs = await prisma.rFQ.findMany({ include: { items: true, vendors: true } });
  for (const rfq of allRfqs) {
    const fallbackVendors = ["Challenger", "CDW", "Insight", "SHI", "Dell"];
    for (const vendorName of fallbackVendors) {
      if (rfq.vendors.length >= 3) break;
      if (!rfq.vendors.some((entry) => entry.vendorId === vendors[vendorName].id)) {
        const responseStatus = rfq.status === "OPEN" ? "PENDING" : rfq.status === "AWARDED" && rfq.vendors.length === 0 ? "ACCEPTED" : "RESPONDED";
        await prisma.rFQVendor.create({ data: { rfqId: rfq.id, vendorId: vendors[vendorName].id, responseStatus } });
        rfq.vendors.push({ vendorId: vendors[vendorName].id });
      }
    }
  }

  const contractData = [
    {
      number: "CON-2025-DELL-001", vendor: "Dell", start: "2025-01-01", end: "2025-12-31", total: "48000.00", frequency: "ANNUAL", status: "EXPIRED", owner: "Procurement",
      items: [["Dell UltraSharp U2723QE", 40, "625.00"], ["Dell WD22TB4 Dock", 40, "210.00"]]
    },
    {
      number: "CON-2026-CHAL-001", vendor: "Challenger", start: "2026-01-01", end: "2026-12-31", total: "72000.00", frequency: "ANNUAL", status: "ACTIVE", owner: "IT Operations",
      items: [["Dell UltraSharp U2723QE", 60, "589.00"], ["Challenger Managed IT Support", 12, "3500.00"]]
    },
    {
      number: "CON-2025-LENOVO-001", vendor: "Lenovo", start: "2025-04-01", end: "2026-03-31", total: "36000.00", frequency: "ANNUAL", status: "EXPIRED", owner: "Workplace Technology",
      items: [["Lenovo ThinkPad T14", 30, "1325.00"]]
    },
    {
      number: "CON-2026-CISCO-001", vendor: "Cisco", start: "2026-02-01", end: "2027-01-31", total: "54000.00", frequency: "ANNUAL", status: "ACTIVE", owner: "Network Engineering",
      items: [["Cisco Catalyst 9200", 12, "2800.00"], ["Cisco Meraki MR46", 25, "720.00"]]
    },
    {
      number: "CON-2026-AWS-001", vendor: "AWS", start: "2026-01-01", end: "2026-12-31", total: "8000.00", frequency: "MONTHLY", status: "ACTIVE", owner: "Cloud Platform Team",
      items: [["AWS EC2", 12, "4200.00"], ["Amazon S3", 12, "1800.00"]]
    },
    {
      number: "CON-2026-GOOGLE-001", vendor: "Google", start: "2026-03-01", end: "2027-02-28", total: "42000.00", frequency: "ANNUAL", status: "ACTIVE", owner: "Cloud Platform Team",
      items: [["Google Cloud Compute Engine", 12, "3100.00"]]
    }
  ];
  const contracts = {};
  for (const contractDataItem of contractData) {
    let contract = await prisma.contract.findUnique({ where: { contractNumber: contractDataItem.number } });
    if (!contract) {
      contract = await prisma.contract.create({
        data: {
          vendorId: vendors[contractDataItem.vendor].id,
          contractNumber: contractDataItem.number,
          startDate: new Date(contractDataItem.start),
          endDate: new Date(contractDataItem.end),
          currency: "USD",
          totalValue: contractDataItem.total,
          billingFrequency: contractDataItem.frequency || "ANNUAL",
          paymentTerms: "Net 30",
          businessOwner: contractDataItem.owner,
          status: contractDataItem.status,
          renewalNoticeDays: 60
        }
      });
    } else {
      contract = await prisma.contract.update({ where: { id: contract.id }, data: { billingFrequency: contractDataItem.frequency || "ANNUAL" } });
    }
    contracts[contractDataItem.number] = contract;
    for (const [model, quantity, unitPrice] of contractDataItem.items) {
      const existingItem = await prisma.contractItem.findFirst({ where: { contractId: contract.id, productId: products[model].id } });
      if (!existingItem) await prisma.contractItem.create({ data: { contractId: contract.id, productId: products[model].id, quantity, unitPrice } });
    }
  }

  const additionalContractData = [
    ["CON-2026-CDW-001", "CDW", "Dell UltraSharp U2723QE", "HPE ProLiant DL380 Gen11"], ["CON-2026-INSIGHT-001", "Insight", "Lenovo ThinkPad T14", "Microsoft 365 E5"],
    ["CON-2026-SHI-001", "SHI", "Cisco Catalyst 9200", "FortiGate 60F"], ["CON-2026-IBM-001", "IBM", "IBM watsonx", "IBM FlashSystem 9500"],
    ["CON-2026-VEEAM-001", "Veeam", "Veeam Data Platform", "Rubrik Security Cloud"], ["CON-2026-VMWARE-001", "VMware", "VMware Cloud Foundation", "VMware vSphere Foundation"],
    ["CON-2026-PALOALTO-001", "Palo Alto Networks", "Palo Alto PA-440", "Palo Alto Cortex XDR Pro"], ["CON-2026-JUNIPER-001", "Juniper Networks", "Juniper EX4400", "Juniper Mist AP45"],
    ["CON-2026-HPE-001", "HPE", "HPE ProLiant DL380 Gen11", "HPE Alletra 6000"], ["CON-2026-EATON-001", "Eaton", "Eaton 9PX 3000i", "Eaton ePDU G3 Managed"],
    ["CON-2026-RICOH-001", "Ricoh", "Ricoh IM C4510", "Ricoh Interactive Whiteboard A6500"], ["CON-2026-CANON-001", "Canon", "Canon imageRUNNER ADVANCE DX C3935i", "Canon DR-G2140"],
    ["CON-2026-EPSON-001", "Epson", "Epson WorkForce Enterprise AM-C6000", "Epson EB-L630U"], ["CON-2026-XEROX-001", "Xerox", "Xerox VersaLink C625", "Xerox AltaLink C8235"],
    ["CON-2026-REDHAT-001", "Red Hat", "Red Hat Enterprise Linux", "Red Hat OpenShift Platform Plus"], ["CON-2026-NUTANIX-001", "Nutanix", "Nutanix Cloud Infrastructure", "Nutanix Database Service"],
    ["CON-2026-PURE-001", "Pure Storage", "Pure Storage FlashArray X20", "Pure Storage FlashBlade"], ["CON-2026-NETAPP-001", "NetApp", "NetApp AFF A250", "NetApp StorageGRID"],
    ["CON-2026-ZSCALER-001", "Zscaler", "Zscaler Internet Access", "Zscaler Private Access"], ["CON-2026-SERVICES-001", "Challenger", "Challenger Managed IT Support", "Cloudflare Zero Trust"],
    ["CON-2026-KYNDRYL-001", "Kyndryl", "IBM Consulting Hybrid Cloud Services", "Veeam Data Platform"], ["CON-2026-RACKSPACE-001", "Rackspace Technology", "AWS EC2", "Amazon S3"]
  ];
  for (const [contractNumber, vendorName, firstModel, secondModel] of additionalContractData) {
    const itemModels = [firstModel, secondModel];
    let contract = await prisma.contract.findUnique({ where: { contractNumber } });
    if (!contract) {
      contract = await prisma.contract.create({ data: { vendorId: vendors[vendorName].id, contractNumber, startDate: new Date("2026-01-01"), endDate: new Date("2026-12-31"), currency: "USD", totalValue: "24000.00", billingFrequency: "ANNUAL", paymentTerms: "Net 30", businessOwner: "Procurement", status: "ACTIVE", renewalNoticeDays: 60, notes: "Synthetic prototype contract; values and commercial terms are illustrative only." } });
    }
    contracts[contractNumber] = contract;
    for (const model of itemModels) {
      const product = products[model];
      await prisma.vendorProduct.upsert({ where: { vendorId_productId: { vendorId: vendors[vendorName].id, productId: product.id } }, update: { notes: "Synthetic prototype supplier relationship" }, create: { vendorId: vendors[vendorName].id, productId: product.id, authorisedReseller: false, leadTimeDays: 21, notes: "Synthetic prototype supplier relationship" } });
      const existingItem = await prisma.contractItem.findFirst({ where: { contractId: contract.id, productId: product.id } });
      if (!existingItem) await prisma.contractItem.create({ data: { contractId: contract.id, productId: product.id, quantity: 10, unitPrice: "1200.00" } });
    }
  }

  const quoteData = [
    ["Dell", "Dell UltraSharp U2723QE", "2025-11-10", 40, "610.00", 21, "Previous monitor refresh quote", "RFQ-2026-001"],
    ["Challenger", "Dell UltraSharp U2723QE", "2026-02-03", 60, "589.00", 14, "Current preferred supplier quote", "RFQ-2026-001"],
    ["HP", "Dell UltraSharp U2723QE", "2026-02-05", 60, "605.00", 18, "Comparison quote", "RFQ-2026-001"],
    ["Dell", "Dell P2422H", "2025-09-15", 25, "239.00", 14, "Previous standard monitor quote"],
    ["Lenovo", "Lenovo ThinkPad T14", "2025-12-01", 30, "1325.00", 21, "Laptop refresh quote", "RFQ-2026-002"],
    ["Challenger", "Lenovo ThinkPad T14", "2026-01-15", 30, "1299.00", 14, "Alternative laptop quote", "RFQ-2026-002"],
    ["Cisco", "Cisco Meraki MR46", "2026-01-20", 25, "720.00", 14, "Wireless upgrade quote", "RFQ-2026-004"],
    ["Challenger", "Cisco Meraki MR46", "2026-01-22", 25, "695.00", 21, "Alternative wireless quote", "RFQ-2026-004"],
    ["AWS", "AWS EC2", "2026-01-05", 12, "4200.00", 1, "Cloud compute estimate", "RFQ-2026-003"],
    ["Google", "Google Cloud Compute Engine", "2026-01-07", 12, "3100.00", 1, "Cloud compute comparison", "RFQ-2026-003"],
    ["Oracle", "Oracle Cloud Database", "2026-01-08", 2, "5800.00", 7, "Managed database comparison", "RFQ-2026-003"]
  ];
  for (const [vendorName, model, date, quantity, unitPrice, leadTimeDays, notes, rfqNumber] of quoteData) {
    const quoteDate = new Date(date);
    const existingQuote = await prisma.quote.findFirst({ where: { vendorId: vendors[vendorName].id, productId: products[model].id, quoteDate } });
    if (!existingQuote) await prisma.quote.create({ data: { vendorId: vendors[vendorName].id, productId: products[model].id, rfqId: rfqNumber ? rfqs[rfqNumber].id : undefined, rfqItemId: rfqNumber ? rfqItems[`${rfqNumber}:${model}`]?.id : undefined, quoteDate, quantity, unitPrice, currency: "USD", leadTimeDays, validityDate: new Date(`${date.slice(0, 4)}-12-31`), notes } });
  }

  const purchaseOrderData = [
    ["Dell", "2025-12-01", "Workplace Technology", "COMPLETED", "Dell monitor refresh", "CON-2025-DELL-001", [["Dell UltraSharp U2723QE", 40, "610.00"]]],
    ["Challenger", "2026-03-01", "IT Operations", "DELIVERED", "Current monitor purchase", "CON-2026-CHAL-001", [["Dell UltraSharp U2723QE", 60, "589.00"], ["Dell WD22TB4 Dock", 60, "195.00"]]],
    ["Lenovo", "2025-12-15", "Workplace Technology", "COMPLETED", "Laptop refresh", "CON-2025-LENOVO-001", [["Lenovo ThinkPad T14", 30, "1325.00"]]],
    ["Cisco", "2026-02-15", "Network Engineering", "APPROVED", "Wireless access point upgrade", "CON-2026-CISCO-001", [["Cisco Meraki MR46", 25, "720.00"]]],
    ["AWS", "2026-02-01", "Cloud Platform Team", "IN_PROGRESS", "Annual cloud compute commitment", "CON-2026-AWS-001", [["AWS EC2", 12, "4200.00"], ["Amazon S3", 12, "1800.00"]]],
    ["Google", "2026-03-15", "Cloud Platform Team", "DELIVERED", "Cloud compute pilot", "CON-2026-GOOGLE-001", [["Google Cloud Compute Engine", 12, "3100.00"]]]
  ];
  for (const [vendorName, date, requestedBy, status, notes, contractNumber, lines] of purchaseOrderData) {
    let purchaseOrder = await prisma.purchaseOrder.findFirst({ where: { vendorId: vendors[vendorName].id, poDate: new Date(date), requestedBy } });
    if (!purchaseOrder) {
      purchaseOrder = await prisma.purchaseOrder.create({ data: { vendorId: vendors[vendorName].id, contractId: contracts[contractNumber].id, poDate: new Date(date), requestedBy, approver: "Finance Manager", currency: "USD", totalAmount: lines.reduce((total, [, quantity, unitPrice]) => total + quantity * Number(unitPrice), 0).toFixed(2), status, notes } });
    } else if (purchaseOrder.contractId !== contracts[contractNumber].id) {
      purchaseOrder = await prisma.purchaseOrder.update({ where: { id: purchaseOrder.id }, data: { contractId: contracts[contractNumber].id } });
    }
    for (const [model, quantity, unitPrice] of lines) {
      const existingLine = await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: purchaseOrder.id, productId: products[model].id } });
      if (!existingLine) await prisma.purchaseOrderLine.create({ data: { purchaseOrderId: purchaseOrder.id, productId: products[model].id, quantity, unitPrice, currency: "USD", lineTotal: (quantity * Number(unitPrice)).toFixed(2) } });
    }
  }

  for (let contractIndex = 0; contractIndex < additionalContractData.length; contractIndex += 1) {
    const [contractNumber, vendorName, firstModel, secondModel] = additionalContractData[contractIndex];
    const contract = contracts[contractNumber];
    const models = [firstModel, secondModel];
    for (let orderIndex = 0; orderIndex < 3; orderIndex += 1) {
      const month = String((contractIndex + orderIndex) % 9 + 1).padStart(2, "0");
      const date = new Date(`2026-${month}-15`);
      const requestedBy = `Procurement Team ${contractIndex + 1}`;
      const lines = models.map((model, lineIndex) => [model, 5 + orderIndex + lineIndex, (850 + contractIndex * 37 + lineIndex * 125).toFixed(2)]);
      const totalAmount = lines.reduce((total, [, quantity, unitPrice]) => total + quantity * Number(unitPrice), 0).toFixed(2);
      let purchaseOrder = await prisma.purchaseOrder.findFirst({ where: { vendorId: vendors[vendorName].id, contractId: contract.id, poDate: date, requestedBy } });
      if (!purchaseOrder) {
        purchaseOrder = await prisma.purchaseOrder.create({ data: { vendorId: vendors[vendorName].id, contractId: contract.id, poDate: date, requestedBy, approver: "Finance Manager", currency: "USD", totalAmount, status: orderIndex === 0 ? "COMPLETED" : orderIndex === 1 ? "DELIVERED" : "APPROVED", notes: "Synthetic prototype purchase order; values are illustrative only." } });
      } else {
        purchaseOrder = await prisma.purchaseOrder.update({ where: { id: purchaseOrder.id }, data: { totalAmount } });
      }
      for (const [model, quantity, unitPrice] of lines) {
        const product = products[model];
        const lineTotal = (quantity * Number(unitPrice)).toFixed(2);
        const existingLine = await prisma.purchaseOrderLine.findFirst({ where: { purchaseOrderId: purchaseOrder.id, productId: product.id } });
        if (!existingLine) await prisma.purchaseOrderLine.create({ data: { purchaseOrderId: purchaseOrder.id, productId: product.id, quantity, unitPrice, currency: "USD", lineTotal } });
      }
    }
  }

  const procurementRequestData = [
    ["PR-2026-001", "Workplace Technology", "Alex Morgan", "Refresh office monitors", "Current monitors are reaching end of life and need replacement across regional offices.", true, "CC-WORKPLACE", "RFQ-2026-005", "CON-2026-CDW-001", "COMPLETED"],
    ["PR-2026-002", "IT Operations", "Jordan Lee", "Laptop refresh for new starters", "Provide standard laptops for the next employee intake.", true, "CC-IT-OPS", "RFQ-2026-002", "CON-2025-LENOVO-001", "COMPLETED"],
    ["PR-2026-003", "Cloud Platform Team", "Priya Nair", "Cloud capacity benchmark", "Compare compute and database providers before the next capacity commitment.", true, "CC-CLOUD", "RFQ-2026-014", null, "IN_PROGRESS"],
    ["PR-2026-004", "Security Operations", "Marcus Wong", "Zero trust security review", "Assess zero trust access and endpoint protection options.", false, "CC-SECURITY", "RFQ-2026-029", null, "IN_PROGRESS"],
    ["PR-2026-005", "Corporate Services", "Emily Carter", "Collaboration licence renewal", "Renew collaboration and document productivity tools for corporate teams.", true, "CC-CORP-SERVICES", "RFQ-2026-008", "CON-2026-CHAL-001", "COMPLETED"],
    ["PR-2026-006", "Network Engineering", "Daniel Chen", "Campus wireless refresh", "Upgrade wireless coverage in the main office and branch locations.", true, "CC-NETWORK", "RFQ-2026-022", "CON-2026-CISCO-001", "COMPLETED"],
    ["PR-2026-007", "People and Culture", "Sophie Tan", "Employee onboarding equipment", "Purchase equipment for the upcoming hiring cohort.", true, "CC-PEOPLE", "RFQ-2026-006", null, "OPEN"],
    ["PR-2026-008", "Finance", "William Hart", "Financial data subscription", "Review the business need and renewal cost for financial market data access.", true, "CC-FINANCE", null, null, "OPEN"],
    ["PR-2026-009", "Executive Office", "Grace Lim", "Executive device refresh", "Replace ageing executive laptops with supported devices.", true, "CC-EXEC", "RFQ-2026-012", null, "IN_PROGRESS"],
    ["PR-2026-010", "Data Protection Team", "Noah Patel", "SaaS backup protection", "Protect collaboration data and reduce recovery risk for core business systems.", false, "CC-DATA-PROTECTION", "RFQ-2026-030", null, "IN_PROGRESS"]
  ];
  for (const [requestNumber, department, requestedBy, purpose, businessNeed, budgeted, costCenter, rfqNumber, contractNumber, status] of procurementRequestData) {
    const existingRequest = await prisma.procurementRequest.findUnique({ where: { requestNumber } });
    if (!existingRequest) {
      await prisma.procurementRequest.create({
        data: {
          requestNumber,
          department,
          requestedBy,
          purpose,
          businessNeed,
          budgeted,
          costCenter,
          status,
          rfqId: rfqNumber ? rfqs[rfqNumber]?.id : undefined,
          contractId: contractNumber ? contracts[contractNumber]?.id : undefined,
          notes: "Synthetic prototype procurement request"
        }
      });
    }
  }

  const departmentPlans = [
    ["Workplace Technology", "RFQ-2026-005", "CON-2026-CDW-001"], ["IT Operations", "RFQ-2026-002", "CON-2025-LENOVO-001"],
    ["Cloud Platform Team", "RFQ-2026-014", "CON-2026-AWS-001"], ["Security Operations", "RFQ-2026-029", "CON-2026-PALOALTO-001"],
    ["Corporate Services", "RFQ-2026-008", "CON-2026-CHAL-001"], ["Network Engineering", "RFQ-2026-022", "CON-2026-CISCO-001"],
    ["People and Culture", "RFQ-2026-006", "CON-2026-HPE-001"], ["Executive Office", "RFQ-2026-012", "CON-2026-INSIGHT-001"],
    ["Customer Operations", "RFQ-2026-017", "CON-2026-SERVICES-001"], ["Data Protection Team", "RFQ-2026-030", "CON-2026-VEEAM-001"],
    ["Service Management", "RFQ-2026-010", "CON-2026-SERVICES-001"], ["Finance", "RFQ-2026-008", "CON-2026-CHAL-001"]
  ];
  for (const [department, planRfqNumber, contractNumber] of departmentPlans) {
    const existingRequests = await prisma.procurementRequest.findMany({ where: { department } });
    const hasCompleted = existingRequests.some((request) => request.status === "COMPLETED" && request.rfqId && request.contractId);
    const needed = Math.max(0, 3 - existingRequests.length);
    for (let index = 0; index < needed; index += 1) {
      const shouldComplete = !hasCompleted && index === 0;
      const requestNumber = `PR-2026-${department.replace(/[^A-Z]/gi, "").slice(0, 5).toUpperCase()}-${index + 1}`;
      const existing = await prisma.procurementRequest.findUnique({ where: { requestNumber } });
      if (!existing) {
        await prisma.procurementRequest.create({
          data: {
            requestNumber,
            department,
            requestedBy: `${department} Requester`,
            purpose: `${department} procurement request ${index + 1}`,
            businessNeed: `Synthetic prototype business need for ${department}.`,
            budgeted: index !== 2,
            costCenter: `CC-${department.replace(/[^A-Z]/gi, "-").toUpperCase().slice(0, 18)}`,
            status: shouldComplete ? "COMPLETED" : index === 1 ? "IN_PROGRESS" : "OPEN",
            rfqId: rfqs[planRfqNumber]?.id,
            contractId: shouldComplete ? contracts[contractNumber].id : undefined,
            notes: "Synthetic prototype procurement request"
          }
        });
      }
    }
  }

  const validation = {
    vendors: await prisma.vendor.count(),
    brands: await prisma.brand.count(),
    categories: await prisma.productCategory.count(),
    products: await prisma.product.count(),
    vendorProducts: await prisma.vendorProduct.count(),
    rfqs: await prisma.rFQ.count(),
    rfqItems: await prisma.rFQItem.count(),
    rfqVendors: await prisma.rFQVendor.count(),
    quotes: await prisma.quote.count(),
    contracts: await prisma.contract.count(),
    contractItems: await prisma.contractItem.count(),
    purchaseOrders: await prisma.purchaseOrder.count(),
    purchaseOrderLines: await prisma.purchaseOrderLine.count()
  };
  const vendorsWithoutContacts = await prisma.vendor.count({ where: { contacts: { none: {} } } });
  const purchaseOrdersWithoutContracts = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int AS count FROM "PurchaseOrder" WHERE "contractId" IS NULL');
  const mismatchedPurchaseOrders = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int AS count FROM "PurchaseOrder" po JOIN "Contract" c ON c.id = po."contractId" WHERE po."vendorId" <> c."vendorId"');
  const rfqVendorCounts = await prisma.rFQ.findMany({ select: { rfqNumber: true, _count: { select: { vendors: true } } } });
  const rfqsWithTooFewVendors = rfqVendorCounts.filter((rfq) => rfq._count.vendors < 3);
  const quotes = await prisma.quote.findMany({ include: { rfqItem: true } });
  const invalidQuotes = quotes.filter((quote) => quote.rfqId && (!quote.rfqItemId || !quote.rfqItem || quote.rfqItem.rfqId !== quote.rfqId || quote.rfqItem.productId !== quote.productId));
  const newContractNumbers = additionalContractData.map(([contractNumber]) => contractNumber);
  const newContracts = await prisma.contract.findMany({ where: { contractNumber: { in: newContractNumbers } }, include: { items: true } });
  const contractsWithTooFewItems = newContracts.filter((contract) => contract.items.length < 2);
  const newPurchaseOrders = await prisma.purchaseOrder.findMany({ where: { requestedBy: { startsWith: "Procurement Team" } }, include: { lines: true } });
  const purchaseOrdersWithTooFewLines = newPurchaseOrders.filter((purchaseOrder) => purchaseOrder.lines.length < 2);
  const invalidLineTotals = newPurchaseOrders.flatMap((purchaseOrder) => purchaseOrder.lines.filter((line) => Number(line.lineTotal) !== Number(line.quantity) * Number(line.unitPrice)));
  const invalidTotals = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS count FROM "PurchaseOrder" po WHERE po."totalAmount" <> (SELECT COALESCE(SUM("lineTotal"), 0) FROM "PurchaseOrderLine" line WHERE line."purchaseOrderId" = po.id)`);
  if (vendorsWithoutContacts > 0 || Number(purchaseOrdersWithoutContracts[0].count) > 0 || Number(mismatchedPurchaseOrders[0].count) > 0 || rfqsWithTooFewVendors.length > 0 || invalidQuotes.length > 0 || contractsWithTooFewItems.length > 0 || purchaseOrdersWithTooFewLines.length > 0 || invalidLineTotals.length > 0 || Number(invalidTotals[0].count) > 0 || validation.vendors < 45 || validation.brands < 55 || validation.categories < 20 || validation.products < 150 || validation.vendorProducts < 180 || validation.rfqs < 30 || validation.rfqItems < 80 || validation.rfqVendors < 90 || validation.quotes < 60 || validation.contracts < 25 || validation.purchaseOrders < 55) {
    throw new Error(`Seed validation failed: vendorsWithoutContacts=${vendorsWithoutContacts}, contractlessPOs=${purchaseOrdersWithoutContracts[0].count}, mismatchedPOs=${mismatchedPurchaseOrders[0].count}, rfqsWithTooFewVendors=${rfqsWithTooFewVendors.length}, invalidQuotes=${invalidQuotes.length}, contractsWithTooFewItems=${contractsWithTooFewItems.length}, purchaseOrdersWithTooFewLines=${purchaseOrdersWithTooFewLines.length}, invalidLineTotals=${invalidLineTotals.length}, invalidPOTotals=${invalidTotals[0].count}`);
  }

  console.log("Seed data created successfully.");
  console.log(validation);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });