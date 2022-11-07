import React, { Fragment } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { injectIntl } from 'react-intl';
import QRCode from 'react-native-qrcode-svg';
import { connect } from 'react-redux';
import { BasicHeader } from '../../../components';

import styles from './transferStyles';

/* Props
 * ------------------------------------------------
 *   @prop { type }    name                - Description....
 */
const AddressView = ({
  intl,
  handleOnModalClose,
  fundType,
  transferType,
  balance,
  currentAccountName,
  selectedAccount,
  accountType,
  pinCode,
}) => {
  const base64Logo =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAMAAABHPGVmAAABEVBMVEUaUJoqVZwkU5stV5z9/v4YT5r///3///9LovL+/v8UT5lPo/L8/f0dUZogUpoAQpZTpPIAPJUxWZ0AJZAASpgAM5Pr7vEALZH2+PgARpcnVZv4+/oAKpHc4ecAI48amfLy9PXS1+AAII+/x9UAHI9FoPLl6e3K0dwRmfI3Xp7X3OPJ3faIl7hDZaDu8/YAMJKSoL25wdFOa6MjmvINTJmlsccunPKlyfPh5eqstsuyvM1An/Jtgq03nvJdd6d2ibBmfaoAN5MAOZSbp8Gbw/LGzdnn8Pjy9/qgrMSCkrW30vVWcaW+1vV8jrODuPJZpvHf6/d4s/KMm7purvIElvLU5Pba6Pdlq/KtzfSPvfIAAInGKpZ5AAANoUlEQVRo3r1ahXbqzBaOTiAkhBga3KWo1KhA3fXY//4PcvdMhIRC4Zd156x1ukrDfLP923tCCf+HRe38ZBgW5y38238LAruv23L9p/8MBI5NfkqFeLZVJ6uVjRckB+c/AAEN4f3jxcHF2UPTUM0ELFM1mqd3k6taBv8t/C9Bwhgh2Tp82lNLpZ6aGssMWfI4pSYqCfrsKAtPbJWG2gKBDg7PU7mEIrMaSzNRWaZgyXKUoVktnerlxE6RE7aZ5hsQULpUfJf1xZhm6SgvijzlW/A7xbC0kVA7B+TZfwICp0PFO1U3aJqhgvv7gCiGlvXxYfJ7lW0CAU3V3lUrykapLSuqGZWz2rcqozZZI3PE6pQmi9TWJTKs1SzCl/4eCIhxcJZLsdEdILDWKE1VrmyU8K4ggFFmEjTDr1iC9z5Y/YvIGokyMeOukkhC8iKR0ih+xcgyuC1tL/C2oC+ItKEW4XRcBu0EwgnxWYWhg5riZVpjDLVn6Xoup1umEtXSQRRW3YsLHPr5ukZj1FeMg6GuBa0hM6y8qCSoh6f+xWQyue3M9uYlhWUCx9BKfSGMbi67WN3fg3BCtmkGVCVGaUapqKcX5YOCowwuGa9f7FUUCFGfK/MKVtj9c+aLLNQXOZoLTfR7Dhs1E8PbVtJ+AHmFJH401MX08lGete4kAXWrlwiFvwORhPjQDGAwrDmflbtOQrYBSPXCMLeKsrQdz4xTWUFC+5+P34JwQmFm+TB4mU3lzuvJdfUpjNNnXVNoT2OiVpnAFj8+X65XFEYFMKROSVuqWUwzFnsEEBK3PoOGhRZjMEt9mTN4+PrX528URPGBwOeTCi37lJyyOrXvygUIM0gw3jcYg60JKPOcXxWF8gtSNymGX1q8x5Y5u25trMxC4VRNLz19Dv6F9qej+00gEIRDlRWX0WedbS0UsNdtifUUTOtlALnPH3/cBFAon7IuKj6js6VOcnthDQtXFu19h84dAshjPnbyA3HSGhBOKKrysniwOmBI25mMUDQZ38EmWJLGS34fCbW4F/qU93Ty3PTcUdT0s10w4GtHPnWxJSzJ/ufL9C0j1AaCGy9LkIHueZbILh7iu2CEheRs7lMX2CTM/RnFqqFXIQm1XwqAEKu7gvCMYWR3wYCvlX0uLPMQ8kLm7SQSGbWR0L9wazLlsoajCus9TFsDYRdqKAm1puKlfJ5WHwqC8BqpRmINMMrAdK1CuYLseU/zYHRO2AkjeZZg/WkFzi60p5FQbPQnIxT/uggYngjiYqRTzdpuRkcXJXaZICDXt7DdRwAyhUg5SFE1WxTKxig8LAOX1ge7ySFNTEbml1kogVP99ctxJBQ5+XUNyvnryAfCCVee/SDNnWUEbns3IXQ7etRXtaIUrvIQJZFQKFKNvULGqZwXyE4YJIzQe4L2ChxhBFsgQJutU91fGUGQDsRF99cJAcE+PDNTRQ8kYHa69yRt05aEhOShMQ9UaeL2IMhnLOSAZM5U84LkKxukPnczihw1r7ZYHVfF1iw3pvkAj6hAtDuChCLHkO2lzlw5TWJRKAJ1m3O9hMG+Ht7ST8QvFJNm/Bii1jtPYtdqYEHA8OBdQj9BQ3TaIBzWnpPjebZ0+x0Ghigc7ZVEdoVBKiLOET+PQ1gQcGHgLMJFrlkaYBchIDU25ZxLjs6/MTuGSJZPc0C5xBX+uLgCOTJvUyJIKJa/BPI0yTVzfVyJKbsiOg4MmWG4UVsYQqrPLJVOUyscdWyWQQ60n7cxQpH8I+KEw1xTPS3YIL5whxTfR2tBSJubrD+ZJk2vsGRg2z3MtqFaRRyM6vFPAYOwBoODnoIt0UXOLYk42jluLYLQLc/MXpSlVhm9pig4wwvtk5ALckLq7y0EEtE+Bsmc9WxJ7ByPKVDYF9oS9mgpOxla8yi72hXxsmaysFEYtY+rDkYoMrrE9epCp+ncwAEBxmH7PE8vTgtSvUCCwRlvEG5aKz8ZFSUd4L5O6aFL5wc4Vz6eeBghXE7go3eLpfULYpMwxHuKcRy4B3nraFiOL7sMVDgod5pWYqyl17RYrJF7L0AGQPdTHwYORWCKTz023buDqkFhjs0YUce5rA4UieFfw/6gVYvHD1pXR/1TuWcp6RWndZvFnjjgcD7ez4c8DNuBMWmY08wCYpSAZFNi1LV7H5RZn6cSukI3m1ElUbJUg6HT8pomG9re0iyLM1nmshFZYoQi0x/YESAhQtMxhH4Fg7RUWXZBcLyDMpu0bKRShpxm6TTE0BcEHowh5tJAlDkJXT83Yj6M2Ai3KKAg0WAYBfdfKyDAzsISoZI8maFsaHdBUeOE0icME/34NYqFfHKAIKAOYGQLmI6sA9EnAvm7mmI3TCFIFtUMPdXJIhxSmcfjEz+GbZEw/BvkaGo9CA54SGllVdGi67QErJqmlYrYz2IujtDrc6Ma8WMQ1woT1lvSxLUg1jvJKiCLVqLwVAXPbcjC85toGj4yTH3vFqTAmur+ro4iAQxIWzhGnBD3gWQVXnZLKJRFLsPBY7V3RVd4mmWhd0/j1l1j03xqbiXST+U4LsAIZdofjWpAVaCsz0vnmPEmpPYlyIHsxgnpldB1G/s+avX3VD1nmaoCa9HTS7rKnvfLB5JAFJVpv41OVsSAQvJ2QxgwSe1gPQVqIBeMeOCAXdxbXmYQJBSEh4J358Ph3nB4eta5HRRrSWTXXwyRn65ChGInL682yw4LE8zE04sZCUZ/7nJ4Xbf69oqQnbekZLcb73YLmbCTkBGsm8e30TSyoils9OMfgoORPF9AHqITHcEG8WVh3CVDRn38jO2/Sng7f8ZHZGWu2/u/8msgoIyctJHNscGbFJxG6NzESZCo79WTtIVLA+p+TEfHz4+vNxxaLilzc/2zvf8cGzXAFpEvGLEq1EOn4pFi4jZ4GCRYGTs4UFC78RIaNapvl/v3j21Yj/f3+3+eP2In+cb0OBL7igAYxyCHg8Fh3gsmkGVMj+0aX5xHHR9msFEARLr8jMUi1ekon8+PYOXzjfxoegJkJLYWAT6fRjwMzHvNKAQz5Me4SyTiXpfB0zksH9gJkh7ZcbnIL6H1KxZpfLx6c8iwIN1ZQLJEMm5xiIT0lHB5F22eSSQr3Dw3XOqxeW9PjJPR/g3yJiNu9YCO5RDZvAv+P9Q9vi2CFnG4CTd/PmNbNnchqo2PNkKcr1vv69iVYDOXQWJgw3BZJ231BTsvZP40IpFdIPKR3zeCjxLi/cZYENY8d7kwiRST9ppS5oB8AVAuP4+3CAPRkq9eviL/WBhqxV2CRDcpT2GvCSpbyyZI77vTV6n90ghthgFbHTcwBArMqSTbtfB5xazXn5AGW2H8szHOPhK63j/OV9fGBThbaJp/2QeIIHledus0oSq+xnTiNaau3zmJ6udlJE/iz88UAKE6bRy/3V+jFTEwBevrZC+ZMet2q+O12E2X2MMfE1fu4eD76PX+OZZvnJCtYyRYqhD41bffPzN287jSSx7lyGgDmCKmQ/4WW7j1RkR8Gid8zneHAjnx8qM6akD45xuN/DT0cfn4mkHo6y0AsJC6KtrHtfNWYOzh82IKekzJUzQZbkJ2f23f78P6fd/+gROnsG6kBxhFI0Wyh+2//rGHTbZ8c4/SxN9BeNd9y9y/9gowjKfKip08/EqnPL/DonjDBSZxJAQGr+Fw2JvXbrpjhE9bTWf4h+mCN4Wmlg9MlpMrnhGhd9o+Mli9nqqLjhwUM/YNmij/zHLhjSDF9Fgd/C0UUBU6UlK02+DCjNiTl/IdpOj6hY2SOOR2GnrZZwSq0IfeXnRizTwtLI9IBTy8tBwLiwyDWw9uJ2HwU8UHnXb6C5w1Wj41BIbPUie3HHCLDK2fZ3e5ESXzg1tFZd2REXjnkT+GgmP0wnliObXlZdaUB5ltMHiYkywPS7w3BoERSLCHplbGfXuq/9KBNfSzIsIaD2+83gaIqxmQy+hyFGvNkgGfWb3ayHpO6Kisp3RaknOxsQYApiDlWQ+ae9+UcDFcGcVSqzPYouiXBVpPPqEAxbYpmwQLWmL8w0bMHBydJub+5h4w0qujWOpL0BbZhe96AzfRfE/fey9nC8GLN5Ss1SezcUllaP8NmGY2W6vxRa1JP3s9Tfb3P1Foe3SdOu8PitlaLd6N10hbPGuaFXPMpuXA6EAfHnyJYWqNP9ZOc8GOGti5RhtzCzphVtsbNrWoYuq6mYpqbGB8IDLpyll8++0csX73riIHLxrJfTXN8Ab0xAq0xWNoukAGPvgQO871143411/LZiamwq7MOEi/6C3gtSt3s/iOTRmgdZlo0wVzfU9naGq3C2b7NpI1Suet9TmV2nQbH++Yc/B+frd7bJmNWsYkueFWntqcuOunOZWl14wjvg5AWKY3v8tuvGOjNk/ihcLgAUcBI2+eG9gOMbbMs7q0+Y6N+n5wOjg1EymGTVPiVyDnVQxe1Y1OMfPdHRv1fSESCvWOZlkpGrr4qH/Sgl8q0TTGMHPq6WTbyyvUtrG/gGqDu6ZVSahGlPYWExVTC73SS88mxYKw7f2Yra/5kAFk7er26UFWrVwpVyqV4No/sTCa553Dei25ywtF1A4MAW+BpMJB8WpwSNagfFXMxpOcV3r/k1ev1h01TErKf/JWVPAVMofZhf/ma2S7v6n2L9b/AODt5rxpnWUSAAAAAElFTkSuQmCC';

  return (
    <Fragment>
      <BasicHeader
        title={intl.formatMessage({ id: `transfer.${transferType}` })}
        backIconName="close"
      />
      <View style={styles.container}>
        <ScrollView>
          {accountType !== 'postingKey' &&
            accountType !== 'memoKey' &&
            accountType !== 'steemConnect' && (
              <View>
                <View style={styles.topContent}>
                  <QRCode
                    value="Just some string value"
                    size={200}
                    logo={{ uri: base64Logo }}
                    logoSize={50}
                    logoMargin={2}
                    logoBackgroundColor="transparent"
                  />
                </View>
                <View style={styles.middleContent}>
                  <Text style={styles.description}>TEST</Text>
                </View>
              </View>
            )}
          {(accountType === 'postingKey' ||
            accountType === 'memoKey' ||
            accountType === 'steemConnect') && <Text>Cannot generate Address</Text>}
        </ScrollView>
      </View>
    </Fragment>
  );
};

const mapStateToProps = (state) => ({
  pinCode: state.application.pin,
  globalProps: state.account.globalProps,
  currency: state.application.currency.currency,
  isPinCodeOpen: state.application.isPinCodeOpen,
});

export default connect(mapStateToProps)(injectIntl(AddressView));
