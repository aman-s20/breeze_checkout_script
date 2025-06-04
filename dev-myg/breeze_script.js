console.log('[Breeze] 🚀 Breeze module script loaded successfully');

document.addEventListener('DOMContentLoaded', function () {
    let paymentMethodsContainer = document.querySelector('.litecheckout__payment-methods');
    const form = document.querySelector('#litecheckout_payments_form');
    
    console.log('DOMContentLoaded is triggered .... ');

    // Client-side validation rules
    const validators = {
        email: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        b_phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
        s_zipcode: value => /^[1-9][0-9]{5}$/.test(value),
        b_zipcode: value => /^[1-9][0-9]{5}$/.test(value),
        s_phone: value => /^\+?[1-9]\d{1,14}$/.test(value),
        phone: value =>  /^\+?[1-9]\d{1,14}$/.test(value)
        
    };

    if (!paymentMethodsContainer) {
        console.error('paymentMethods container not found!');
        return;  // Exit if container not found
    }
    

    // Form validation logic
    function isFormValid() {
        let isValid = true;

        form.querySelectorAll('[data-ca-lite-checkout-field]').forEach(field => {
                const value = field.value.trim();
                const fieldName = field.dataset.caLiteCheckoutField.split('.').pop();
                const label = field.labels?.[0]?.innerText || field.name || 'Field';
                const isRequired = field.labels?.[0]?.classList.contains('cm-required');
                console.log(`Validating field: ${label}, Value: ${value}, filed: ${fieldName} , Required: ${isRequired}`);

                // Required field check
                if (isRequired && !value) {
                    console.warn(`Validation failed - Required field "${label}" is empty.`);
                    isValid = false;
                    return; // Skip further validation if field is empty
                }

                // Custom validator check
                if (value && validators[fieldName] && !validators[fieldName](value)) {
                    console.warn(`Validation failed - Field "${label}" failed custom validation: ${fieldName}`);
                    isValid = false;
                    return;
                }
            });

        return isValid;
    }
   
    // Handle Breeze payment submission
    function handleBreezePayment(event) {
        event.preventDefault(); // ALWAYS prevent default submission if this handler is active
        event.stopPropagation(); // ALWAYS stop propagation

        if (isFormValid()) {
            console.log('Form is valid, proceeding with Breeze payment.');
            window.breeze.startCheckout();
        } else {
            console.log('Form is invalid, not proceeding with Breeze payment.');
            // Submission is already prevented. User feedback for errors can be added here.
        }
    }


    // Function to handle payment method change
    function handlePaymentMethodChange() {  
        paymentMethodsContainer = document.querySelector('.litecheckout__payment-methods');
        const activePayment = document.querySelector('#sw_payment_methods_94 span').innerText;
        
        console.log('Payment method changed to:', activePayment);
        
        const isBreezeSelected = activePayment === 'Breeze Checkout';

        console.log("isBreezeSelected >>>", isBreezeSelected);
      
        if (isBreezeSelected) {
            console.log('Breeze payment method selected.');
            // Set Breeze payment handler to validate and proceed to Breeze payment
            paymentMethodsContainer.onsubmit = handleBreezePayment;
        } else {
            console.log('Resetting to default behavior.');
            // Reset to default form submission behavior
            paymentMethodsContainer.onsubmit = null;
        }
    }

    // Observe the specific element for changes in its text content
    const paymentMethodContainer = document.querySelector('#sw_payment_methods_94');
    if (paymentMethodContainer) {
        console.log('Found payment method container, setting up observer');
        
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
            // Trigger callback for meaningful DOM changes
                if (
                    mutation.type === 'childList' && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)
                ) {
                    handlePaymentMethodChange();
                    break;
                }
                if (mutation.type === 'characterData') {
                    handlePaymentMethodChange();
                    break;
                }
                if (mutation.type === 'attributes') {
                    handlePaymentMethodChange();
                    break;
                }
            }
        });
        
        // Observer config: monitor all major types of DOM changes
        const config = {
            childList: true,       // Watch for added/removed elements
            attributes: true,      // Watch for attribute changes (like class, style)
            characterData: true,   // Watch for text changes
            subtree: true          // Include all descendant elements
        };

        observer.observe(container, config);
    }

    // Handle the payment method change on page load (first-time load)
    handlePaymentMethodChange();
});
